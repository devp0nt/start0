import type { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientProcessCtx"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import { Gen0Target } from "@ideanick/tools/gen0/target"
import type { Gen0Utils } from "@ideanick/tools/gen0/utils"

export class Gen0PluginsManager {
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

  add(plugins: Gen0Plugin[]) {
    const filteredPlugins = plugins.filter((p1) => !this.plugins.some((p2) => this.isSame(p1, p2)))
    this.plugins.push(...filteredPlugins)
    return filteredPlugins
  }

  async addPluginsByGlob(glob: Gen0Fs.PathOrPaths) {
    glob = this.fs.toPaths(glob)
    const plugins = await this.findAndCreateMany(glob)
    return this.add(plugins)
  }

  async addAll() {
    return await this.addPluginsByGlob(this.config.pluginsGlob)
  }

  removeByGlob(pluginsGlob: Gen0Fs.PathOrPaths) {
    const pluginsEntries = this.plugins.map((c, index) => ({
      index,
      plugin: c,
    }))
    const removedPluginsEntries = pluginsEntries.filter(
      ({ plugin }) => plugin.file && !this.fs.isPathMatchGlob(plugin.file.path.abs, pluginsGlob),
    )
    for (const { index } of removedPluginsEntries) {
      this.plugins.splice(index, 1)
    }
    return removedPluginsEntries.map(({ plugin }) => plugin)
  }

  removeByName(nameSearch: Gen0Utils.Search) {
    const pluginsEntries = this.plugins.map((c, index) => ({
      index,
      plugin: c,
    }))
    const removedPluginsEntries = pluginsEntries.filter(({ plugin }) => plugin.isMatchName(nameSearch))
    for (const { index } of removedPluginsEntries) {
      this.plugins.splice(index, 1)
    }
    return removedPluginsEntries.map(({ plugin }) => plugin)
  }

  getByGlob(pluginsGlob: Gen0Fs.PathOrPaths) {
    return this.plugins.find((c) => c.isMatchGlob(pluginsGlob))
  }

  getByName(nameSearch: Gen0Utils.Search) {
    return this.plugins.filter((c) => c.isMatchName(nameSearch))
  }

  async findAndCreateMany(pluginsGlob: Gen0Fs.PathOrPaths) {
    const pluginsPaths = await this.fs.findFilesPaths({
      glob: pluginsGlob,
    })
    return await Promise.all(
      pluginsPaths.map((filePath) => Gen0Plugin.createByFilePath({ filePath, config: this.config })),
    )
  }

  async findAndCreateAll() {
    return await this.findAndCreateMany(this.config.pluginsGlob)
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
}

export namespace Gen0PluginsManager {
  export type PluginsMeta = Gen0Plugin.Meta[]
}
