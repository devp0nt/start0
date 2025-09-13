import type { File0, Fs0 } from "@devp0nt/fs0"
import type { Gen0Config } from "@devp0nt/gen0/config"
import { Gen0Logger } from "@devp0nt/gen0/logger"
import { Gen0Plugin } from "@devp0nt/gen0/plugin"
import type { Gen0Watcher } from "@devp0nt/gen0/watcher"

export class Gen0PluginsManager {
  static logger = Gen0Logger.create("pluginsManager")
  logger = Gen0PluginsManager.logger

  config: Gen0Config
  fs0: Fs0
  plugins: Gen0Plugin[] = []

  constructor({ config, fs0 }: { config: Gen0Config; fs0: Fs0 }) {
    this.config = config
    this.fs0 = fs0
  }

  static create({ config, fs0 }: { config: Gen0Config; fs0: Fs0 }) {
    return new Gen0PluginsManager({ config, fs0 })
  }

  async createByPath(filePath: string) {
    return Gen0Plugin.createByFilePath({ filePath, config: this.config })
  }

  async createByDefinition(
    definition: Gen0Plugin.Definition,
    rest?: {
      fs0?: Fs0
      file0?: File0
    },
  ) {
    return Gen0Plugin.createByDefinition({
      definition,
      config: this.config,
      fs0: rest?.fs0 || this.fs0,
      file0: rest?.file0,
    })
  }

  async add(newPlugins: Gen0Plugin[], init: boolean = false) {
    for (const newPlugin of newPlugins) {
      const exPluginIndex = this.plugins.findIndex((exPlugin) => newPlugin.isSame(exPlugin))
      if (exPluginIndex === -1) {
        this.plugins.push(newPlugin)
        this.logger.debug(`add plugin "${newPlugin.file0?.path.rel || newPlugin.name}"`)
      } else {
        this.plugins[exPluginIndex] = newPlugin
        this.logger.debug(`update plugin "${newPlugin.file0?.path.rel || newPlugin.name}"`)
      }
      if (init) {
        await newPlugin.init()
      }
    }
    return newPlugins
  }

  async addPluginsByGlob(glob: Fs0.PathOrPaths, init: boolean = false) {
    glob = this.fs0.toPaths(glob)
    const plugins = await this.findAndCreateManyByGlob(glob)
    return await this.add(plugins, init)
  }
  async addPluginsByDefinitions(definitions: Gen0Plugin.DefinitionWithName[], init: boolean = false) {
    const plugins = await Promise.all(definitions.map((definition) => this.createByDefinition(definition)))
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
      fs0?: Fs0
      file0?: File0
    },
    init: boolean = false,
  ) {
    const plugin = await this.createByDefinition(definition, rest)
    await this.add([plugin], init)
    return plugin
  }

  async addAll(init: boolean = false) {
    const pluginsByGlob = await this.addPluginsByGlob(this.config.pluginsGlob, init)
    const pluginsByConfig = await this.addPluginsByDefinitions(this.config.pluginsDefinitions, init)
    return [...pluginsByGlob, ...pluginsByConfig]
  }

  removeByGlob(pluginsGlob: Fs0.PathOrPaths) {
    const removedPlugins: typeof this.plugins = []
    for (const plugin of this.plugins) {
      if (plugin.file0 && this.fs0.isPathMatchGlob(plugin.file0.path.abs, pluginsGlob)) {
        removedPlugins.push(plugin)
      }
    }
    return this.remove(removedPlugins)
  }

  removeByNameSearch(nameSearch: Fs0.StringMatchInput) {
    const removedPlugins: typeof this.plugins = []
    for (const plugin of this.plugins) {
      if (plugin.isMatchName(nameSearch)) {
        removedPlugins.push(plugin)
      }
    }
    return this.remove(removedPlugins)
  }

  removeByPath(path: Fs0.PathOrPaths) {
    const removedPlugins: typeof this.plugins = []
    for (const plugin of this.plugins) {
      if (plugin.file0?.path.abs === path) {
        removedPlugins.push(plugin)
      }
    }
    return this.remove(removedPlugins)
  }

  remove(plugins: Gen0Plugin[]) {
    this.plugins = this.plugins.filter((plugin) => plugins.every((p) => !p.isSame(plugin)))
    for (const plugin of plugins) {
      this.logger.debug(`remove plugin ${plugin.file0?.path.rel}`)
    }
    return plugins
  }

  getByGlob(pluginsGlob: Fs0.PathOrPaths) {
    return this.plugins.find((c) => c.isMatchGlob(pluginsGlob))
  }

  getByName(nameSearch: Fs0.StringMatchInput) {
    return this.plugins.filter((c) => c.isMatchName(nameSearch))
  }

  getByPath(path: string) {
    return this.plugins.find((c) => c.file0?.path.abs === path)
  }

  getByDir(dir: string) {
    return this.plugins.filter((p) => p.file0 && this.fs0.isPathInDir(p.file0.path.abs, dir))
  }

  async findAndCreateManyByGlob(pluginsGlob: Fs0.PathOrPaths) {
    const pluginsPaths = await this.fs0.findFilesPaths({
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

  isMatchGlob(plugin: Gen0Plugin, pluginsGlob: Fs0.PathOrPaths) {
    return plugin.isMatchGlob(pluginsGlob)
  }

  isMatchName(plugin: Gen0Plugin, nameSearch: Fs0.StringMatchInput) {
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
