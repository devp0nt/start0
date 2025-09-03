import type { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientProcessCtx"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0File } from "@ideanick/tools/gen0/file"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Utils } from "@ideanick/tools/gen0/utils"
import type { Gen0Watcher } from "@ideanick/tools/gen0/watcher"

// TODO: add to fns property .getPluginName()
// TODO: add possibility to rename plugins when use

export class Gen0Plugin {
  config: Gen0Config
  file?: Gen0File
  name: string
  fns: Gen0Plugin.FnsRecord
  vars: Gen0Plugin.VarsRecord
  watchersDefinitions: Gen0Plugin.WatchersDefinitionsRecord

  private constructor({
    config,
    name,
    fns,
    vars,
    file,
    watchersDefinitions,
  }: {
    config: Gen0Config
    name: string
    fns?: Gen0Plugin.FnsRecord
    vars?: Gen0Plugin.VarsRecord
    file?: Gen0File
    watchersDefinitions?: Gen0Plugin.WatchersDefinitionsRecord
  }) {
    this.config = config
    this.file = file
    this.name = name
    this.fns = fns || {}
    this.vars = vars || {}
    this.watchersDefinitions = watchersDefinitions || {}
  }

  static async createByDefinition({
    definition,
    config,
    name,
    file,
  }: {
    definition: Gen0Plugin.Definition
    config: Gen0Config
    name: string
    file?: Gen0File
  }) {
    return new Gen0Plugin({
      config,
      name,
      fns: definition.fns,
      vars: definition.vars,
      watchersDefinitions: definition.watchers,
      file,
    })
  }

  static async createByFilePath({ filePath, config }: { filePath: string; config: Gen0Config }) {
    const file = Gen0File.create({ filePath, config })
    const imported = await file.import()
    const definition = imported?.default || imported
    if (!definition) {
      throw new Error(`No plugin definition found in ${filePath}`)
    }
    return new Gen0Plugin({
      config,
      name: definition.name,
      fns: definition.fns,
      vars: definition.vars,
      watchersDefinitions: definition.watchersDefinitions,
      file,
    })
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
  export type Definition = {
    name?: string
    fns?: Gen0Plugin.FnsRecord
    vars?: Gen0Plugin.VarsRecord
    watchers?: Gen0Plugin.WatchersDefinitionsRecord
  }
  export type DefinitionWithName = Omit<Definition, "name"> & { name: string }

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
