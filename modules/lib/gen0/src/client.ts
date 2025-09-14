import { File0, Fs0 } from "@devp0nt/fs0"
import { Gen0ClientProcess } from "./clientProcess"
import type { Gen0Config } from "./config"
import { Gen0Logger } from "./logger"
import type { Gen0Plugin } from "./plugin"
import type { Gen0PluginsManager } from "./pluginsManager"
import { Gen0Target } from "./target"

export class Gen0Client {
  static logger = Gen0Logger.create("client")
  logger = Gen0Client.logger

  config: Gen0Config
  file0: File0
  name: string
  pluginsManager: Gen0PluginsManager
  selfPlugin: Gen0Plugin | undefined

  private constructor({
    filePath,
    config,
    name,
    pluginsManager,
  }: { filePath: string; config: Gen0Config; name?: string; pluginsManager: Gen0PluginsManager }) {
    this.config = config
    this.file0 = File0.create({ filePath, rootDir: config.rootDir })
    this.name = name || this.file0.path.rel
    this.pluginsManager = pluginsManager
  }

  static create({
    filePath,
    config,
    name,
    pluginsManager,
  }: {
    filePath: string
    config: Gen0Config
    name?: string
    pluginsManager: Gen0PluginsManager
  }) {
    return new Gen0Client({ filePath, config, name, pluginsManager })
  }

  async process({ dryRun }: { dryRun: boolean }) {
    const clientProcess = await Gen0ClientProcess.start({ client: this, dryRun })
    return clientProcess
  }

  isSame(client: Gen0Client) {
    return this.file0.path.abs === client.file0.path.abs
  }

  isMatchGlob(clientsGlob: Fs0.PathOrPaths) {
    return this.file0.fs0.isPathMatchGlob(this.file0.path.abs, clientsGlob)
  }

  isMatchName(nameSearch: Fs0.StringMatchInput) {
    const result = Fs0.isStringMatch(this.name, nameSearch)
    return result
  }

  hasTargets() {
    return this.file0.isContentMatch([Gen0Target.startMark, Gen0Target.silentMark])
  }

  getMeta(): Gen0Client.Meta {
    return {
      name: this.name,
      path: this.file0.path.rel,
    }
  }

  async replaceSelfPlugin(definition: Gen0Plugin.DefinitionWithName) {
    const plugin = await this.pluginsManager.createByDefinition(definition, {
      fs0: this.file0.fs0,
      file0: this.file0,
    })
    if (this.selfPlugin) {
      await this.pluginsManager.remove([this.selfPlugin])
    }
    await this.pluginsManager.add([plugin])
    this.selfPlugin = plugin
    return plugin
  }

  async removeSelfPlugin() {
    if (this.selfPlugin) {
      await this.pluginsManager.remove([this.selfPlugin])
      this.selfPlugin = undefined
    }
  }

  async applySelfPlugin() {
    if (this.selfPlugin) {
      await this.pluginsManager.add([this.selfPlugin])
    }
  }
}

export namespace Gen0Client {
  export type Meta = {
    name: string
    path: string
  }
}
