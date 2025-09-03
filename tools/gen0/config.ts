import nodePath from "node:path"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
// import { Gen0Utils } from "@ideanick/tools/gen0/utils"
import { findUpSync } from "find-up"
import { workspaceRoot } from "workspace-root"

// TODO: respect json configs

export class Gen0Config {
  static configFilesNames = [".gen0rc.mjs", ".gen0rc.ts", ".gen0rc.js"]
  static defaultPluginsGlob: Gen0Fs.PathOrPaths = ["**/*.gen0.{ts,tsx,js,jsx,mjs}"]
  static defaultClientsGlob: Gen0Fs.PathOrPaths = ["**/*.{ts,tsx,js,jsx,mjs,json}"]

  rootDir: string
  // gitignoreGlob: string[]
  clientsGlob: Gen0Fs.PathOrPaths
  pluginsGlob: Gen0Fs.PathOrPaths
  pluginsDefinitions: Gen0Config.PluginsDefinitions
  afterProcessCmd: Gen0Config.AfterProcessCmd | undefined

  private constructor({
    rootDir,
    // gitignoreGlob,
    afterProcessCmd,
    pluginsGlob,
    clientsGlob,
    pluginsDefinitions,
  }: {
    rootDir: string
    // gitignoreGlob: string[]
    afterProcessCmd?: Gen0Config.AfterProcessCmd
    pluginsGlob?: Gen0Fs.PathOrPaths
    clientsGlob?: Gen0Fs.PathOrPaths
    pluginsDefinitions?: Gen0Config.PluginsDefinitions
  }) {
    this.rootDir = rootDir
    this.afterProcessCmd = afterProcessCmd
    // this.gitignoreGlob = gitignoreGlob || []
    this.pluginsGlob = pluginsGlob || Gen0Config.defaultPluginsGlob
    this.clientsGlob = clientsGlob || Gen0Config.defaultClientsGlob
    this.pluginsDefinitions = pluginsDefinitions || []
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
    const { afterProcessCmd, plugins, clientsGlob, pluginsGlob } = configDefinition
    // const gitignoreGlob = await Gen0Utils.getGitignoreGlob(rootDir)
    const config = new Gen0Config({
      rootDir,
      // gitignoreGlob,
      afterProcessCmd,
      pluginsDefinitions: plugins,
      clientsGlob,
      pluginsGlob,
    })
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

  getMeta() {
    return {
      rootDir: this.rootDir,
      afterProcessCmd: this.afterProcessCmd,
      pluginsGlob: this.pluginsGlob,
      clientsGlob: this.clientsGlob,
      plugins: this.pluginsDefinitions.map((plugin) => plugin.name),
    }
  }
}

export namespace Gen0Config {
  export type Definition = {
    rootDir?: string
    afterProcessCmd?: AfterProcessCmd
    pluginsGlob?: Gen0Fs.PathOrPaths
    clientsGlob?: Gen0Fs.PathOrPaths
    plugins?: Gen0Config.PluginsDefinitions
  }

  export type AfterProcessCmdString = string
  export type AfterProcessCmdFn = (filePath: string) => AfterProcessCmdString
  export type AfterProcessCmd = AfterProcessCmdString | AfterProcessCmdFn
  export type PluginsDefinitions = Gen0Plugin.DefinitionWithName[]
}
