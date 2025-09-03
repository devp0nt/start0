import type { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientProcessCtx"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0File } from "@ideanick/tools/gen0/file"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import { Gen0Utils } from "@ideanick/tools/gen0/utils"
import { Gen0Watcher } from "@ideanick/tools/gen0/watcher"

// TODO: add to fns property .getPluginName()
// TODO: add possibility to rename plugins when use

export class Gen0Plugin {
  static logger = Gen0Logger.create("plugin")
  logger = Gen0Plugin.logger

  config: Gen0Config
  file?: Gen0File
  fs: Gen0Fs
  name: string
  fns: Gen0Plugin.FnsRecord
  vars: Gen0Plugin.VarsRecord
  watchers: Gen0Watcher[]

  private constructor({
    config,
    name,
    fns,
    vars,
    file,
    fs,
    watchers,
  }: {
    config: Gen0Config
    name: string
    fns?: Gen0Plugin.FnsRecord
    vars?: Gen0Plugin.VarsRecord
    file?: Gen0File
    fs: Gen0Fs
    watchers?: Gen0Watcher[]
  }) {
    this.config = config
    this.file = file
    this.fs = fs
    this.name = name
    this.fns = fns || {}
    this.vars = vars || {}
    this.watchers = watchers || []
  }

  static async createByDefinition({
    definition,
    config,
    name,
    file,
    fs,
  }: {
    definition: Gen0Plugin.DefinitionResult
    config: Gen0Config
    name: string
    file?: Gen0File
    fs: Gen0Fs
  }) {
    const plugin = new Gen0Plugin({
      config,
      name,
      fns: definition.fns,
      vars: definition.vars,
      watchers: [],
      file,
      fs,
    })
    plugin.watchers = await plugin.createWatchersByDefinitions(definition.watchers || {})
    return plugin
  }

  static async createByFilePath({ filePath, config }: { filePath: string; config: Gen0Config }) {
    const file = Gen0File.create({ filePath, config })
    const imported = await file.import()
    const definitionOrFn = imported?.default || imported
    const definition = typeof definitionOrFn === "function" ? await definitionOrFn({ fs: file.fs }) : definitionOrFn
    if (!definition) {
      throw new Error(`No plugin definition found in ${filePath}`)
    }
    return Gen0Plugin.createByDefinition({
      definition,
      config,
      name: definition.name,
      file,
      fs: file.fs,
    })
  }

  async createWatchersByDefinitions(watchersDefinitions: Gen0Plugin.WatchersDefinitionsRecord) {
    return await Promise.all(
      Object.entries(watchersDefinitions).map(([name, watcherDefinition]) => {
        return Gen0Watcher.create({
          plugin: this,
          name,
          watch: watcherDefinition.watch,
          handler: watcherDefinition.handler,
          clientsGlob: watcherDefinition.clientsGlob,
          clientsNames: watcherDefinition.clientsNames,
          fs: this.fs,
        })
      }),
    )
  }

  isSame(plugin: Gen0Plugin) {
    return this.file?.path.abs === plugin.file?.path.abs || this.name === plugin.name
  }

  isMatchGlob(pluginsGlob: Gen0Fs.PathOrPaths): boolean {
    return this.file?.fs.isPathMatchGlob(this.file.path.abs, pluginsGlob) || false
  }

  isMatchName(nameSearch: Gen0Utils.Search) {
    return Gen0Utils.isStringMatch(this.name, nameSearch)
  }

  getMeta(): Gen0Plugin.Meta {
    return {
      name: this.name,
      ...(this.file ? { path: this.file.path.rel } : {}),
    }
  }

  getFnsMeta(): Gen0Plugin.FnsMeta {
    return Object.entries(this.fns).map(([name]) => ({ name, plugin: this.name }))
  }

  getVarsMeta(): Gen0Plugin.VarsMeta {
    return Object.entries(this.vars).map(([name]) => ({ name, plugin: this.name }))
  }

  getFnsWithMeta(): Gen0Plugin.FnsWithMeta {
    return Object.entries(this.fns).map(([name, fn]) => ({ fn, name, plugin: this.name }))
  }

  getVarsWithMeta(): Gen0Plugin.VarsWithMeta {
    return Object.entries(this.vars).map(([name, value]) => ({ value, name, plugin: this.name }))
  }
}

export namespace Gen0Plugin {
  export type FnsRecord = Record<string, Gen0ClientProcessCtx.Fn>
  export type VarsRecord = Record<string, Gen0ClientProcessCtx.Var>
  export type WatchersDefinitionsRecord = Record<string, Gen0Watcher.Definition>
  export type WatchersDefinitionsWithNamesRecord = Record<string, Gen0Watcher.DefinitionWithName>
  export type DefinitionResult = {
    name?: string
    fns?: Gen0Plugin.FnsRecord
    vars?: Gen0Plugin.VarsRecord
    watchers?: Gen0Plugin.WatchersDefinitionsRecord
  }
  export type DefinitionWithName = Omit<DefinitionResult, "name"> & { name: string }
  export type DefinitionFn = ({ fs }: { fs: Gen0Fs }) => DefinitionResult | Promise<DefinitionResult>
  export type Definition = DefinitionResult | DefinitionFn

  export type Meta = {
    name: string
    path?: string
  }
  export type FnMeta = {
    name: string
    plugin: string
  }
  export type FnsMeta = FnMeta[]
  export type FnWithMeta = FnMeta & {
    fn: Gen0ClientProcessCtx.Fn
  }
  export type FnsWithMeta = FnWithMeta[]
  export type VarMeta = {
    name: string
    plugin: string
  }
  export type VarsMeta = VarMeta[]
  export type VarWithMeta = VarMeta & {
    value: any
  }
  export type VarsWithMeta = VarWithMeta[]
}
