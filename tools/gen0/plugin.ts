import type { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientCtx"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0File } from "@ideanick/tools/gen0/file"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Target } from "@ideanick/tools/gen0/target"

// TODO: add to fns property .getPluginName()
// TODO: add possibility to rename plugins when use

export class Gen0Plugin {
  config: Gen0Config
  file?: Gen0File
  name: string
  fns: Gen0Plugin.Fns
  vars: Gen0Plugin.Vars

  private constructor({
    config,
    name,
    fns,
    vars,
    file,
  }: { config: Gen0Config; name: string; fns?: Gen0Plugin.Fns; vars?: Gen0Plugin.Vars; file?: Gen0File }) {
    this.config = config
    this.file = file
    this.name = name
    this.fns = fns || {}
    this.vars = vars || {}
  }

  static async createByDefinition({
    definition,
    config,
    file,
  }: {
    definition: Gen0Plugin.Definition
    config: Gen0Config
    file?: Gen0File
  }) {
    return new Gen0Plugin({ config, name: definition.name, fns: definition.fns, vars: definition.vars, file })
  }

  static async createByFilePath({ filePath, config }: { filePath: string; config: Gen0Config }) {
    const file = Gen0File.create({ filePath, config })
    const definition = await file.import()
    return Gen0Plugin.createByDefinition({ definition, config, file })
  }

  static async findAndCreateAll({ fs, config }: { fs: Gen0Fs; config: Gen0Config }) {
    const pluginsPaths = await fs.findFilesPathsContentMatch({
      glob: config.pluginsGlob,
      search: [Gen0Target.startMark, Gen0Target.silentMark],
    })
    return await Promise.all(pluginsPaths.map((filePath) => Gen0Plugin.createByFilePath({ filePath, config })))
  }

  static assignPluginsToConfig({ config, plugins }: { config: Gen0Config; plugins: Gen0Config.Plugins }) {
    const pluginsFns = {}
    const pluginsVars = {}
    for (const plugin of Object.values(plugins)) {
      config.plugins[plugin.name] = plugin
      Object.assign(pluginsFns, plugin.fns)
      Object.assign(pluginsVars, plugin.vars)
    }
    Object.assign(config.fns, pluginsFns)
    Object.assign(config.vars, pluginsVars)
  }
}

export namespace Gen0Plugin {
  export type Fns = Gen0ClientProcessCtx.Fns
  export type Vars = Gen0ClientProcessCtx.Vars
  export type Definition<TFns extends Fns | undefined = undefined, TVars extends Vars | undefined = undefined> = {
    name: string
    fns?: TFns
    vars?: TVars
  }
}
