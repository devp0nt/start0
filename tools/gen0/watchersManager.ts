import type { Gen0ClientsManager } from "@ideanick/tools/gen0/clientsManager"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import type { Gen0PluginsManager } from "@ideanick/tools/gen0/pluginsManager"
import { Gen0Utils } from "@ideanick/tools/gen0/utils"
import { Gen0Watcher } from "@ideanick/tools/gen0/watcher"
import type { EventType as ParcelEventType } from "@parcel/watcher"
import parcel from "@parcel/watcher"
// import chokidar, { type FSWatcher as ChokidarFSWatcher, type EmitArgsWithName } from "chokidar"
// import fs from "fs"
import { isGitIgnored } from "globby"

export class Gen0WatchersManager {
  static logger = Gen0Logger.create("watchersManager")
  logger = Gen0WatchersManager.logger

  config: Gen0Config
  pluginsManager: Gen0PluginsManager
  clientsManager: Gen0ClientsManager
  watchers: Gen0Watcher[] = []
  watchGlob: string[] = []
  fs: Gen0Fs
  isGitIgnored: (path: string) => boolean = (path) => false
  // chokidarWatcher: ChokidarFSWatcher | null = null
  // bunWatcher: fs.FSWatcher | null = null
  parcelWatcher: { unsubscribe: () => void } | null = null

  constructor({
    pluginsManager,
    config,
    fs,
    clientsManager,
  }: { pluginsManager: Gen0PluginsManager; config: Gen0Config; fs: Gen0Fs; clientsManager: Gen0ClientsManager }) {
    this.config = config
    this.pluginsManager = pluginsManager
    this.clientsManager = clientsManager
    this.watchers = []
    this.fs = fs
  }

  static async create({
    pluginsManager,
    config,
    fs,
    clientsManager,
  }: {
    pluginsManager: Gen0PluginsManager
    config: Gen0Config
    fs: Gen0Fs
    clientsManager: Gen0ClientsManager
  }) {
    const watchersManager = new Gen0WatchersManager({ pluginsManager, config, fs, clientsManager })
    watchersManager.isGitIgnored = await isGitIgnored({ cwd: watchersManager.config.rootDir })
    return watchersManager
  }

  // async createIsIgnored() {
  //   const isIgnoredByGit = await isGitIgnored({ cwd: this.config.rootDir })
  //   return (path: string) => isIgnoredByGit(path) || path.split("/")[0] === ".git"
  // }

  getWatchersDefinitionsWithPlugins(): { watchersDefinition: Gen0Watcher.DefinitionWithName; plugin: Gen0Plugin }[] {
    return this.pluginsManager.plugins.reduce(
      (acc, plugin) => {
        for (const [watcherName, watcherDefinition] of Object.entries(plugin.watchersDefinitions)) {
          acc.push({
            watchersDefinition: { ...watcherDefinition, name: watcherDefinition.name || watcherName },
            plugin,
          })
        }
        return acc
      },
      [] as { watchersDefinition: Gen0Watcher.DefinitionWithName; plugin: Gen0Plugin }[],
    )
  }

  add(watchers: Gen0Watcher[]) {
    const filteredWatchers = watchers.filter((w1) => !this.watchers.some((w2) => this.isSame(w1, w2)))
    this.watchers.push(...filteredWatchers)
    for (const watcher of filteredWatchers) {
      this.logger.debug(`add watcher ${watcher.name} from ${watcher.plugin.name}`)
    }
    return filteredWatchers
  }

  remove(watchers: Gen0Watcher[]) {
    this.watchers = this.watchers.filter((watcher) => watchers.every((w) => !w.isSame(watcher)))
    for (const watcher of watchers) {
      this.logger.debug(`remove: ${watcher.name}`)
    }
    return watchers
  }

  async createAll() {
    const watchersDefinitionsWithPlugins = this.getWatchersDefinitionsWithPlugins()
    const watchers = await Promise.all(
      watchersDefinitionsWithPlugins.map(({ watchersDefinition, plugin }) => {
        return Gen0Watcher.create({
          plugin,
          fs: plugin.file?.fs || this.fs,
          clientsManager: this.clientsManager,
          name: watchersDefinition.name,
          watch: watchersDefinition.watch,
          handler: watchersDefinition.handler,
          clientsGlob: watchersDefinition.clientsGlob,
          clientsNames: watchersDefinition.clientsNames,
        })
      }),
    )
    return watchers
  }

  async addAll() {
    const watchers = await this.createAll()
    return this.add(watchers)
  }

  pruneAll() {
    this.watchers = []
  }

  async actualizeAll() {
    // this.pruneAll()
    // await this.addAll()
    const actualWatchers = await this.createAll()
    const toRemoveWatchers = this.watchers.filter((watcher) => this.watchers.every((w) => !w.isSame(watcher)))
    await this.remove(toRemoveWatchers)
    return this.add(actualWatchers)
  }

  // actualizeChokidarWatcher() {
  //   if (!this.chokidarWatcher) {
  //     return
  //   }
  //   const diff = this.getActualWatchGlobDiff()
  //   if (diff.add.length > 0) {
  //     this.chokidarWatcher.add(diff.add)
  //   }
  //   if (diff.remove.length > 0) {
  //     this.chokidarWatcher.unwatch(diff.remove)
  //   }
  // }

  // async actualizeEverything() {
  //   await this.actualizeAll()
  //   this.actualizeChokidarWatcher()
  // }

  getAllWatchersWatchGlob(): string[] {
    return this.watchers.reduce((acc, watcher) => {
      acc.push(...watcher.watchGlob)
      return acc
    }, [] as string[])
  }

  getActualWatchGlobDiff(): { add: string[]; remove: string[] } {
    const actualWatchGlob = this.getAllWatchersWatchGlob()
    const add = this.watchGlob.filter((w) => !actualWatchGlob.includes(w))
    const remove = actualWatchGlob.filter((w) => !this.watchGlob.includes(w))
    return { add, remove }
  }

  getAllWatchersOriginalMeta(): Gen0Watcher.OriginalMeta[] {
    return this.watchers.map((watcher) => watcher.getOriginalMeta())
  }

  getAllWatchersRealMeta(): Gen0Watcher.RealMeta[] {
    return this.watchers.map((watcher) => watcher.getRealMeta())
  }

  isSame(watcher1: Gen0Watcher, watcher2: Gen0Watcher) {
    return watcher1.isSame(watcher2)
  }

  // async watchAllByChokidar() {
  //   this.chokidarWatcher = chokidar
  //     .watch(this.config.rootDir, {
  //       cwd: this.config.rootDir,
  //       ignored: [/(^|[/\\])\.git/, this.isGitIgnored],
  //       persistent: true,
  //       // ignoreInitial: true
  //     })
  //     .on("all", (event, path) => {
  //       const pathAbs = this.fs.toAbs(path)
  //       for (const watcher of this.watchers) {
  //         watcher.handler(event, pathAbs)
  //       }
  //     })
  //   return this.chokidarWatcher
  // }

  // async watchAllByNative() {
  //   this.bunWatcher = fs.watch(this.config.rootDir, { recursive: true }, (originalEvent, path) => {
  //     if (!path) return
  //     console.log(originalEvent, path)
  //     const pathAbs = this.fs.toAbs(path)
  //     if (/(^|[/\\])\.git/.test(path)) return
  //     if (this.isGitIgnored(path)) return

  //     // normalize event type like chokidar
  //     // to "all" | "ready" | "add" | "change" | "addDir" | "unlink" | "unlinkDir" | "raw" | "error"
  //     // from "change" | "rename"
  //     const event: "change" | "addDir" | "unlink" = (() => {
  //       if (originalEvent === "change") return "change"
  //       const stat = (() => {
  //         try {
  //           return fs.statSync(pathAbs)
  //         } catch {
  //           return null
  //         }
  //       })()
  //       if (!stat) return "unlink"
  //       if (stat.isDirectory()) return "addDir"
  //       return "change"
  //     })()

  //     for (const watcher of this.watchers) {
  //       watcher.handler(event, pathAbs)
  //     }
  //   })
  //   return this.bunWatcher
  // }

  async handleClientsUpdates(event: Gen0WatchersManager.EventType, path: string) {
    if (event !== "delete") {
      if (!this.fs.isPathMatchGlob(path, this.config.clientsGlob)) {
        return
      }
      const exClient = this.clientsManager.getByPath(path)
      if (exClient) {
        return
      }
      this.clientsManager.addByPath(path)
    } else {
      const exClients = this.clientsManager.getByDir(path)
      for (const exClient of exClients) {
        this.clientsManager.removeByPath(exClient.file.path.abs)
      }
    }
  }

  async handlePluginsUpdates(event: Gen0WatchersManager.EventType, path: string) {
    if (event !== "delete") {
      if (!this.fs.isPathMatchGlob(path, this.config.pluginsGlob)) {
        return
      }
      const exPlugin = this.pluginsManager.getByPath(path)
      if (exPlugin) {
        return
      }
      this.pluginsManager.addByPath(path)
    } else {
      const exPlugins = this.pluginsManager.getByDir(path)
      for (const exPlugin of exPlugins) {
        if (exPlugin.file) {
          this.pluginsManager.removeByPath(exPlugin.file.path.abs)
        }
      }
    }
  }

  async watchAllByParcel() {
    const gitignoreGlob = await Gen0Utils.getGitignoreGlob(this.config.rootDir)
    this.parcelWatcher = await parcel.subscribe(
      this.config.rootDir,
      (error, events) => {
        for (const { path, type: originalEvent } of events) {
          const pathAbs = this.fs.toAbs(path)
          if (/(^|[/\\])\.git/.test(path)) return
          if (this.isGitIgnored(path)) return

          // normalize event type like chokidar
          // to "all" | "ready" | "add" | "change" | "addDir" | "unlink" | "unlinkDir" | "raw" | "error"
          // from "create" | "update" | "delete"
          // const event: "change" | "addDir" | "unlink" | "add" = (() => {
          //   if (originalEvent === "update") return "change"
          //   if (originalEvent === "delete") return "unlink"
          //   const stat = (() => {
          //     try {
          //       return fs.statSync(pathAbs)
          //     } catch {
          //       return null
          //     }
          //   })()
          //   if (!stat) return "unlink"
          //   if (stat.isDirectory()) return "addDir"
          //   return "add"
          // })()
          const event = originalEvent

          this.handleClientsUpdates(event, pathAbs)
          this.handlePluginsUpdates(event, pathAbs)
          for (const watcher of this.watchers) {
            watcher.handler(event, pathAbs)
          }
        }
      },
      {
        ignore: [".git/**/*", ...gitignoreGlob],
      },
    )
    return this.parcelWatcher
  }
}

export namespace Gen0WatchersManager {
  // export type NativeEvent = "change" | "addDir" | "unlink"
  // export type ChokidarEvent = Exclude<EmitArgsWithName[0], "all">
  export type EventType = ParcelEventType
}
