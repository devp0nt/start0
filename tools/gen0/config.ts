import nodePath from "node:path"
import type { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientCtx"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import { findUpSync } from "find-up"
import { workspaceRoot } from "workspace-root"

// TODO: respect json configs

export class Gen0Config {
  static configFilesNames = [".gen0rc.mjs", ".gen0rc.ts", ".gen0rc.js"]
  static defaultPluginsGlob: Gen0Fs.PathOrPaths = ["**/*.gen0.{ts,tsx,js,jsx,mjs}"]
  static defaultClientsGlob: Gen0Fs.PathOrPaths = ["**/*.{ts,tsx,js,jsx,mjs,json}"]

  rootDir: string
  clientsGlob: Gen0Fs.PathOrPaths
  pluginsGlob: Gen0Fs.PathOrPaths
  plugins: Gen0Config.Plugins
  fns: Gen0Config.Fns
  vars: Gen0Config.Vars
  afterProcessCmd: Gen0Config.AfterProcessCmd | undefined

  private constructor({
    rootDir,
    afterProcessCmd,
    pluginsGlob,
    clientsGlob,
    plugins,
    fns,
    vars,
  }: {
    rootDir: string
    afterProcessCmd?: Gen0Config.AfterProcessCmd
    pluginsGlob?: Gen0Fs.PathOrPaths
    plugins?: Gen0Config.Plugins
    clientsGlob?: Gen0Fs.PathOrPaths
    fns?: Gen0Config.Fns
    vars?: Gen0Config.Vars
  }) {
    this.rootDir = rootDir
    this.afterProcessCmd = afterProcessCmd
    this.pluginsGlob = pluginsGlob || Gen0Config.defaultPluginsGlob
    this.clientsGlob = clientsGlob || Gen0Config.defaultClientsGlob
    this.plugins = plugins || {}
    this.fns = fns || {}
    this.vars = vars || {}
  }

  static async create({ cwd }: { cwd: string }) {
    const configPath = Gen0Config.getConfigPath({ cwd })
    const configDefinition = await (async () => {
      if (!configPath) {
        return {}
      }
      return await Gen0Config.parseConfig({ configPath })
    })()
    const rootDir =
      configDefinition.rootDir ||
      (configPath && nodePath.dirname(configPath)) ||
      (await Gen0Config.getWorkspaceRootDir({ cwd }))
    if (!rootDir) {
      throw new Error("Project root dir not found")
    }
    const { afterProcessCmd, plugins, fns, vars } = configDefinition
    const config = new Gen0Config({ rootDir, afterProcessCmd, plugins, fns, vars })
    Gen0Plugin.assignPluginsToConfig({ config, plugins: config.plugins })
    return config
  }

  static getConfigPath = ({ cwd }: { cwd: string }) => {
    return findUpSync(Gen0Config.configFilesNames, { cwd })
  }

  static async getWorkspaceRootDir({ cwd }: { cwd: string }) {
    return await workspaceRoot(cwd)
  }

  static async parseConfig({ configPath }: { configPath: string }): Promise<Gen0Config.Definition> {
    const config = await import(configPath)
    return config.default || config
  }
}

export namespace Gen0Config {
  export type Definition<
    TPluginsDefinitions extends PluginsDefinitions | undefined = undefined,
    TFns extends Fns | undefined = undefined,
    TVars extends Vars | undefined = undefined,
  > = {
    rootDir?: string
    afterProcessCmd?: AfterProcessCmd
    pluginsGlob?: Gen0Fs.PathOrPaths
    clientsGlob?: Gen0Fs.PathOrPaths
    plugins?: TPluginsDefinitions
    fns?: TFns
    vars?: TVars
  }

  export type Fns = Gen0ClientProcessCtx.Fns
  export type Vars = Gen0ClientProcessCtx.Vars

  export type AfterProcessCmdString = string
  export type AfterProcessCmdFn = (filePath: string) => AfterProcessCmdString
  export type AfterProcessCmd = AfterProcessCmdString | AfterProcessCmdFn
  export type PluginsDefinitions = Record<string, Gen0Plugin.Definition>
  export type Plugins = Record<string, Gen0Plugin>
}
