import type { Gen0Config } from "@/tools/gen0/config"
import type { Gen0File } from "@/tools/gen0/file"
import type { Gen0Fs } from "@/tools/gen0/fs"
import { Gen0Logger } from "@/tools/gen0/logger"
import { Gen0Plugin } from "@/tools/gen0/plugin"
import type { Gen0Utils } from "@/tools/gen0/utils"
import type { Gen0Watcher } from "@/tools/gen0/watcher"

export class Gen0PluginsManager {
  static logger = Gen0Logger.create("pluginsManager")
  logger = Gen0PluginsManager.logger

  config: Gen0Config
  fs: Gen0Fs
  plugins: Gen0Plugin[] = []

  constructor({ config, fs }: { config: Gen0Config; fs: Gen0Fs }) {
    this.config = config
    this.fs = fs
  }

  static create({ config, fs }: { config: Gen0Config; fs: Gen0Fs }) {
    return new Gen0PluginsManager({ config, fs })
  }

  async createByPath(filePath: string) {
    return Gen0Plugin.createByFilePath({ filePath, config: this.config })
  }

  async createByDefinition(
    definition: Gen0Plugin.DefinitionWithName,
    rest?: {
      fs?: Gen0Fs
      file?: Gen0File
    },
  ) {
    return Gen0Plugin.createByDefinition({
      definition,
      config: this.config,
      name: definition.name,
      fs: rest?.fs || this.fs,
      file: rest?.file,
    })
  }

  async add(newPlugins: Gen0Plugin[], init: boolean = false) {
    for (const newPlugin of newPlugins) {
      const exPluginIndex = this.plugins.findIndex((exPlugin) => newPlugin.isSame(exPlugin))
      if (exPluginIndex === -1) {
        this.plugins.push(newPlugin)
        this.logger.debug(`add plugin ${newPlugin.file?.path.rel}`)
      } else {
        this.plugins[exPluginIndex] = newPlugin
        this.logger.debug(`update plugin ${newPlugin.file?.path.rel}`)
      }
      if (init) {
        await newPlugin.init()
      }
    }
    return newPlugins
  }

  async addPluginsByGlob(glob: Gen0Fs.PathOrPaths, init: boolean = false) {
    glob = this.fs.toPaths(glob)
    const plugins = await this.findAndCreateManyByGlob(glob)
    return await this.add(plugins, init)
  }

  async addByPath(path: string, init: boolean = false) {
    const plugin = await this.createByPath(path)
    await this.add([plugin], init)
    return plugin
  }

  async addByDefinition(
    definition: Gen0Plugin.DefinitionWithName,
    rest?: {
      fs?: Gen0Fs
      file?: Gen0File
    },
    init: boolean = false,
  ) {
    const plugin = await this.createByDefinition(definition, rest)
    await this.add([plugin], init)
    return plugin
  }

  async addAll(init: boolean = false) {
    return await this.addPluginsByGlob(this.config.pluginsGlob, init)
  }

  removeByGlob(pluginsGlob: Gen0Fs.PathOrPaths) {
    const removedPlugins: typeof this.plugins = []
    for (const plugin of this.plugins) {
      if (plugin.file && this.fs.isPathMatchGlob(plugin.file.path.abs, pluginsGlob)) {
        removedPlugins.push(plugin)
      }
    }
    return this.remove(removedPlugins)
  }

  removeByNameSearch(nameSearch: Gen0Utils.Search) {
    const removedPlugins: typeof this.plugins = []
    for (const plugin of this.plugins) {
      if (plugin.isMatchName(nameSearch)) {
        removedPlugins.push(plugin)
      }
    }
    return this.remove(removedPlugins)
  }

  removeByPath(path: Gen0Fs.PathOrPaths) {
    const removedPlugins: typeof this.plugins = []
    for (const plugin of this.plugins) {
      if (plugin.file?.path.abs === path) {
        removedPlugins.push(plugin)
      }
    }
    return this.remove(removedPlugins)
  }

  remove(plugins: Gen0Plugin[]) {
    this.plugins = this.plugins.filter((plugin) => plugins.every((p) => !p.isSame(plugin)))
    for (const plugin of plugins) {
      this.logger.debug(`remove plugin ${plugin.file?.path.rel}`)
    }
    return plugins
  }

  getByGlob(pluginsGlob: Gen0Fs.PathOrPaths) {
    return this.plugins.find((c) => c.isMatchGlob(pluginsGlob))
  }

  getByName(nameSearch: Gen0Utils.Search) {
    return this.plugins.filter((c) => c.isMatchName(nameSearch))
  }

  getByPath(path: string) {
    return this.plugins.find((c) => c.file?.path.abs === path)
  }

  getByDir(dir: string) {
    return this.plugins.filter((p) => p.file && this.fs.isPathInDir(p.file?.path.abs, dir))
  }

  async findAndCreateManyByGlob(pluginsGlob: Gen0Fs.PathOrPaths) {
    const pluginsPaths = await this.fs.findFilesPaths({
      glob: pluginsGlob,
    })
    return await Promise.all(
      pluginsPaths.map((filePath) => Gen0Plugin.createByFilePath({ filePath, config: this.config })),
    )
  }

  async findAndCreateAll() {
    return await this.findAndCreateManyByGlob(this.config.pluginsGlob)
  }

  async initAll() {
    await Promise.all(this.plugins.map((plugin) => plugin.init()))
  }

  isSame(plugin1: Gen0Plugin, plugin2: Gen0Plugin) {
    return plugin1.isSame(plugin2)
  }

  isMatchGlob(plugin: Gen0Plugin, pluginsGlob: Gen0Fs.PathOrPaths) {
    return plugin.isMatchGlob(pluginsGlob)
  }

  isMatchName(plugin: Gen0Plugin, nameSearch: Gen0Utils.Search) {
    return plugin.isMatchName(nameSearch)
  }

  getPluginsMeta(): Gen0PluginsManager.PluginsMeta {
    return this.plugins.map((plugin) => plugin.getMeta())
  }

  getFnsRecord(): Gen0Plugin.FnsRecord {
    return this.plugins.reduce((acc, plugin) => {
      for (const [fnName, fn] of Object.entries(plugin.fns)) {
        acc[fnName] = fn
      }
      return acc
    }, {} as Gen0Plugin.FnsRecord)
  }

  getFnsMeta(): Gen0Plugin.FnsMeta {
    return this.plugins.flatMap((plugin) => plugin.getFnsMeta())
  }

  getFnsWithMeta(): Gen0Plugin.FnsWithMeta {
    return this.plugins.flatMap((plugin) => plugin.getFnsWithMeta())
  }

  getVarsRecord(): Gen0Plugin.VarsRecord {
    return this.plugins.reduce((acc, plugin) => {
      for (const [varName, value] of Object.entries(plugin.vars)) {
        acc[varName] = value
      }
      return acc
    }, {} as Gen0Plugin.VarsRecord)
  }

  getVarsMeta(): Gen0Plugin.VarsMeta {
    return this.plugins.flatMap((plugin) => plugin.getVarsMeta())
  }

  getVarsWithMeta(): Gen0Plugin.VarsWithMeta {
    return this.plugins.flatMap((plugin) => plugin.getVarsWithMeta())
  }

  getWatchers(): Gen0Watcher[] {
    return this.plugins.flatMap((plugin) => plugin.watchers)
  }
}

export namespace Gen0PluginsManager {
  export type PluginsMeta = Gen0Plugin.Meta[]
}
