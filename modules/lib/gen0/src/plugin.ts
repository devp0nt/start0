import { File0, Fs0 } from '@devp0nt/fs0'
import _, { uniq } from 'lodash'
import type { Gen0ClientProcessCtx } from './clientProcessCtx'
import type { Gen0Config } from './config'
import { Gen0Logger } from './logger'
import { Gen0Watcher } from './watcher'

// TODO: add to fns property .getPluginName()
// TODO: add possibility to rename plugins when use

export class Gen0Plugin {
  static logger = Gen0Logger.create('plugin')
  logger = Gen0Plugin.logger

  config: Gen0Config
  file0?: File0
  fs0: Fs0
  name: string
  fns: Gen0Plugin.FnsRecord
  vars: Gen0Plugin.VarsRecord
  watchers: Gen0Watcher[]
  onInit: (() => Promise<void>) | undefined

  private constructor({
    config,
    name,
    fns,
    vars,
    file0,
    fs0,
    watchers,
    onInit,
  }: {
    config: Gen0Config
    name: string
    fns?: Gen0Plugin.FnsRecord
    vars?: Gen0Plugin.VarsRecord
    file0?: File0
    fs0: Fs0
    watchers?: Gen0Watcher[]
    onInit?: () => Promise<void>
  }) {
    this.config = config
    this.file0 = file0
    this.fs0 = fs0
    this.name = name
    this.fns = fns || {}
    this.vars = vars || {}
    this.watchers = watchers || []
    this.onInit = onInit
  }

  static async createByDefinition({
    definition: definitionOrFn,
    config,
    name,
    file0,
    fs0,
  }: {
    definition: Gen0Plugin.Definition
    config: Gen0Config
    name?: string
    file0?: File0
    fs0: Fs0
  }) {
    const definition = typeof definitionOrFn === 'function' ? await definitionOrFn({ fs0, _ }) : definitionOrFn
    if (!definition) {
      throw new Error(`No plugin definition found in ${file0?.path.rel}`)
    }
    const plugin = new Gen0Plugin({
      config,
      name: name || definition.name || 'unknown',
      fns: definition.fns,
      vars: definition.vars,
      watchers: [],
      file0,
      fs0,
      onInit: definition.init,
    })
    plugin.watchers = await plugin.createWatchersByDefinitions(definition.watchers || {})
    return plugin
  }

  static async createByFilePath({ filePath, config }: { filePath: string; config: Gen0Config }) {
    const file0 = File0.create({ filePath, rootDir: config.rootDir })
    const definition = await file0.import({ moduleCache: false, default: true })
    return Gen0Plugin.createByDefinition({
      definition,
      config,
      file0,
      fs0: file0.fs0,
    })
  }

  init = async () => {
    if (this.onInit) {
      try {
        await this.onInit()
        this.logger.debug(`plugin init ${uniq([this.name, this.file0?.path.rel]).filter(Boolean).join(':')} completed`)
      } catch (error) {
        this.logger.error(
          `plugin init ${uniq([this.name, this.file0?.path.rel]).filter(Boolean).join(':')} failed\n`,
          error,
        )
      }
    }
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
          fs0: this.fs0,
        })
      }),
    )
  }

  isSame(plugin: Gen0Plugin) {
    return this.file0?.path.abs === plugin.file0?.path.abs || this.name === plugin.name
  }

  isMatchGlob(pluginsGlob: Fs0.PathOrPaths): boolean {
    return this.file0?.fs0.isPathMatchGlob(this.file0.path.abs, pluginsGlob) || false
  }

  isMatchName(nameSearch: Fs0.StringMatchInput) {
    return Fs0.isStringMatch(this.name, nameSearch)
  }

  getMeta(): Gen0Plugin.Meta {
    return {
      name: this.name,
      ...(this.file0 ? { path: this.file0.path.rel } : {}),
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
    init?: () => Promise<void>
  }
  export type DefinitionWithName = Omit<DefinitionResult, 'name'> & { name: string }
  export type DefinitionFnCtx = { fs0: Fs0; _: typeof _ }
  export type DefinitionFn = (ctx: DefinitionFnCtx) => DefinitionResult | Promise<DefinitionResult>
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
