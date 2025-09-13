import nodePath from "node:path"
// import { Gen0Utils } from "@/tools/gen0/utils"
import { findUpSync } from "find-up"
import { workspaceRoot } from "workspace-root"
import { Fs0 } from "@/tools/fs0"
import { Gen0Logger } from "@/tools/gen0/logger"
import type { Gen0Plugin } from "@/tools/gen0/plugin"

// TODO: respect json configs

export class Gen0Config {
  static logger = Gen0Logger.create("config")
  logger = Gen0Config.logger

  static configFilesNames = [".gen0rc.mjs", ".gen0rc.ts", ".gen0rc.js"]
  static defaultPluginsGlob: Fs0.PathOrPaths = ["**/{*.gen0,gen0}.{ts,tsx,js,jsx,mjs}"]
  static defaultClientsGlob: Fs0.PathOrPaths = ["**/*.{ts,tsx,js,jsx,mjs,json}"]
  static defaultDebug: string | boolean = false

  fs0: Fs0
  rootDir: string
  // gitignoreGlob: string[]
  clientsGlob: Fs0.PathOrPaths
  originalClientsGlob: Fs0.PathOrPaths
  pluginsGlob: Fs0.PathOrPaths
  originalPluginsGlob: Fs0.PathOrPaths
  pluginsDefinitions: Gen0Config.PluginsDefinitions
  afterProcessCmd: Gen0Config.AfterProcessCmd | undefined
  debug: Gen0Config.Debug

  private constructor({
    fs0,
    rootDir,
    // gitignoreGlob,
    afterProcessCmd,
    clientsGlob,
    originalClientsGlob,
    pluginsGlob,
    originalPluginsGlob,
    pluginsDefinitions,
    debug,
  }: {
    fs0: Fs0
    rootDir: string
    // gitignoreGlob: string[]
    afterProcessCmd?: Gen0Config.AfterProcessCmd
    pluginsGlob: Fs0.PathOrPaths
    originalPluginsGlob: Fs0.PathOrPaths
    clientsGlob: Fs0.PathOrPaths
    originalClientsGlob: Fs0.PathOrPaths
    pluginsDefinitions?: Gen0Config.PluginsDefinitions
    debug: Gen0Config.Debug
  }) {
    this.fs0 = fs0
    this.rootDir = rootDir
    this.afterProcessCmd = afterProcessCmd
    // this.gitignoreGlob = gitignoreGlob || []
    this.pluginsGlob = pluginsGlob
    this.clientsGlob = clientsGlob
    this.originalPluginsGlob = originalPluginsGlob
    this.originalClientsGlob = originalClientsGlob
    this.pluginsDefinitions = pluginsDefinitions || []
    this.debug = debug
  }

  static async create({
    cwd,
    configPath,
    configDefinition,
  }: {
    cwd: string
    configPath?: string
    configDefinition?: Gen0Config.Definition
  }) {
    configPath = Gen0Config.getConfigPath({ cwd })
    configDefinition = await (async () => {
      if (configDefinition) {
        return configDefinition
      }
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
    const fs0 = Fs0.create({ rootDir, cwd: rootDir })
    const {
      afterProcessCmd,
      plugins,
      clientsGlob: originalClientsGlob = Gen0Config.defaultClientsGlob,
      pluginsGlob: originalPluginsGlob = Gen0Config.defaultPluginsGlob,
      debug = Gen0Config.defaultDebug,
    } = configDefinition
    const pluginsGlob = fs0.toAbs(originalPluginsGlob)
    const clientsGlob = fs0.toAbs(originalClientsGlob)
    // const gitignoreGlob = await Gen0Utils.getGitignoreGlob(rootDir)
    const config = new Gen0Config({
      rootDir,
      // gitignoreGlob,
      afterProcessCmd,
      pluginsDefinitions: plugins,
      clientsGlob,
      originalClientsGlob: originalClientsGlob,
      pluginsGlob,
      originalPluginsGlob: originalPluginsGlob,
      fs0,
      debug,
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
    debug?: Debug
    pluginsGlob?: Fs0.PathOrPaths
    clientsGlob?: Fs0.PathOrPaths
    plugins?: Gen0Config.PluginsDefinitions
  }

  export type Debug = string | boolean
  export type AfterProcessCmdString = string
  export type AfterProcessCmdFn = (filePath: string) => AfterProcessCmdString
  export type AfterProcessCmd = AfterProcessCmdString | AfterProcessCmdFn
  export type PluginsDefinitions = Gen0Plugin.DefinitionWithName[]
}
