import type { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientProcessCtx"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0File } from "@ideanick/tools/gen0/file"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Utils } from "@ideanick/tools/gen0/utils"

// TODO: add to fns property .getPluginName()
// TODO: add possibility to rename plugins when use

export class Gen0Plugin {
  config: Gen0Config
  file?: Gen0File
  name: string
  fns: Gen0Plugin.FnsRecord
  vars: Gen0Plugin.VarsRecord

  private constructor({
    config,
    name,
    fns,
    vars,
    file,
  }: { config: Gen0Config; name: string; fns?: Gen0Plugin.FnsRecord; vars?: Gen0Plugin.VarsRecord; file?: Gen0File }) {
    this.config = config
    this.file = file
    this.name = name
    this.fns = fns || {}
    this.vars = vars || {}
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
    return new Gen0Plugin({ config, name, fns: definition.fns, vars: definition.vars, file })
  }

  static async createByFilePath({ filePath, config }: { filePath: string; config: Gen0Config }) {
    const file = Gen0File.create({ filePath, config })
    const imported = await file.import()
    const definition = imported?.default || imported
    if (!definition) {
      throw new Error(`No plugin definition found in ${filePath}`)
    }
    return new Gen0Plugin({ config, name: definition.name, fns: definition.fns, vars: definition.vars, file })
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
}

export namespace Gen0Plugin {
  export type FnsRecord = Record<string, Gen0ClientProcessCtx.Fn>
  export type VarsRecord = Record<string, Gen0ClientProcessCtx.Var>
  export type Definition = {
    name?: string
    fns?: Gen0Plugin.FnsRecord
    vars?: Gen0Plugin.VarsRecord
  }
}
