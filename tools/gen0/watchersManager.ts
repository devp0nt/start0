import type { Gen0ClientsManager } from "@ideanick/tools/gen0/clientsManager"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import type { Gen0PluginsManager } from "@ideanick/tools/gen0/pluginsManager"
import { Gen0Watcher } from "@ideanick/tools/gen0/watcher"
import chokidar, { type FSWatcher } from "chokidar"
import { isGitIgnored } from "globby"

export class Gen0WatchersManager {
  config: Gen0Config
  pluginsManager: Gen0PluginsManager
  clientsManager: Gen0ClientsManager
  watchers: Gen0Watcher[] = []
  watchGlob: string[] = []
  fs: Gen0Fs
  isGitIgnored: (path: string) => boolean = (path) => false
  chokidarWatcher: FSWatcher | null = null

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
    return filteredWatchers
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
    this.pruneAll()
    await this.addAll()
  }

  actualizeChokidarWatcher() {
    if (!this.chokidarWatcher) {
      return
    }
    const diff = this.getActualWatchGlobDiff()
    if (diff.add.length > 0) {
      this.chokidarWatcher.add(diff.add)
    }
    if (diff.remove.length > 0) {
      this.chokidarWatcher.unwatch(diff.remove)
    }
  }

  async actualizeEverything() {
    await this.actualizeAll()
    this.actualizeChokidarWatcher()
  }

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

  watchAll() {
    this.chokidarWatcher = chokidar
      .watch([this.config.rootDir, "!.git/**/*"], {
        cwd: this.config.rootDir,
        ignored: [/(^|[/\\])\.git/, this.isGitIgnored],
        persistent: true,
        // ignoreInitial: true
      })
      .on("all", (event, path) => {
        for (const watcher of this.watchers) {
          watcher.handler(event, path)
        }
      })
    return this.chokidarWatcher
  }
}

export namespace Gen0WatchersManager {
  export type WatchersMeta = Gen0Watcher.OriginalMeta[]
}
