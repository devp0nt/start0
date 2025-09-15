import type { Fs0 } from '@devp0nt/fs0'
import type { EventType as ParcelEventType } from '@parcel/watcher'
import parcel from '@parcel/watcher'
// import chokidar, { type FSWatcher as ChokidarFSWatcher, type EmitArgsWithName } from "chokidar"
// import fs from "fs"
import { isGitIgnored } from 'globby'
import type { Gen0ClientsManager } from './clientsManager'
import type { Gen0Config } from './config'
import { Gen0Logger } from './logger'
import type { Gen0PluginsManager } from './pluginsManager'
import { Gen0Utils } from './utils'
import type { Gen0Watcher } from './watcher'

export class Gen0WatchersManager {
  static logger = Gen0Logger.create('watchersManager')
  logger = Gen0WatchersManager.logger

  config: Gen0Config
  pluginsManager: Gen0PluginsManager
  clientsManager: Gen0ClientsManager
  watchGlob: string[] = []
  fs0: Fs0
  isGitIgnored: (path: string) => boolean = (path) => false
  // chokidarWatcher: ChokidarFSWatcher | null = null
  // bunWatcher: fs.FSWatcher | null = null
  parcelWatcher: { unsubscribe: () => void } | null = null

  constructor({
    pluginsManager,
    config,
    fs0,
    clientsManager,
  }: { pluginsManager: Gen0PluginsManager; config: Gen0Config; fs0: Fs0; clientsManager: Gen0ClientsManager }) {
    this.config = config
    this.pluginsManager = pluginsManager
    this.clientsManager = clientsManager
    this.fs0 = fs0
  }

  static async create({
    pluginsManager,
    config,
    fs0,
    clientsManager,
  }: {
    pluginsManager: Gen0PluginsManager
    config: Gen0Config
    fs0: Fs0
    clientsManager: Gen0ClientsManager
  }) {
    const watchersManager = new Gen0WatchersManager({ pluginsManager, config, fs0, clientsManager })
    watchersManager.isGitIgnored = await isGitIgnored({ cwd: watchersManager.config.rootDir })
    watchersManager.fs0 = fs0
    return watchersManager
  }

  getWatchers() {
    return this.pluginsManager.getWatchers()
  }

  getAllWatchersWatchGlob(): string[] {
    return this.getWatchers().reduce((acc, watcher) => {
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
    return this.getWatchers().map((watcher) => watcher.getOriginalMeta())
  }

  getAllWatchersRealMeta(): Gen0Watcher.RealMeta[] {
    return this.getWatchers().map((watcher) => watcher.getRealMeta())
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
  //     console.info(originalEvent, path)
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
    if (event !== 'delete') {
      if (!this.fs0.isPathMatchGlob(path, this.config.clientsGlob)) {
        return
      }
      const exClient = this.clientsManager.getByPath(path)
      if (exClient) {
        if (await exClient.hasTargets()) {
          await this.clientsManager.addByPath(path, true)
          return
        } else {
          this.clientsManager.removeByPath(exClient.file0.path.abs)
          return
        }
      }
      await this.clientsManager.addByPath(path, true)
    } else {
      const exClients = this.clientsManager.getByDir(path)
      for (const exClient of exClients) {
        this.clientsManager.removeByPath(exClient.file0.path.abs)
      }
    }
  }

  async handlePluginsUpdates(event: Gen0WatchersManager.EventType, path: string) {
    if (event !== 'delete') {
      if (!this.fs0.isPathMatchGlob(path, this.config.pluginsGlob)) {
        return
      }
      const exPlugin = this.pluginsManager.getByPath(path)
      if (exPlugin) {
        if (exPlugin.file0) {
          // always true here
          const updatedPlugin = await this.pluginsManager.addByPath(exPlugin.file0.path.abs)
          await updatedPlugin.init()
        }
        return
      }
      const newPlugin = await this.pluginsManager.addByPath(path)
      await newPlugin.init()
    } else {
      const exPlugins = this.pluginsManager.getByDir(path)
      for (const exPlugin of exPlugins) {
        if (exPlugin.file0) {
          await this.pluginsManager.removeByPath(exPlugin.file0.path.abs)
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
          const pathAbs = this.fs0.toAbs(path)
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
          for (const watcher of this.getWatchers()) {
            watcher.handler({ clientsManager: this.clientsManager, fs0: this.fs0 }, event, pathAbs)
          }
        }
      },
      {
        ignore: ['.git/**/*', ...gitignoreGlob],
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
