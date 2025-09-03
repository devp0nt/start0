import { Gen0ClientProcess } from "@ideanick/tools/gen0/clientProcess"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0File } from "@ideanick/tools/gen0/file"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import type { Gen0PluginsManager } from "@ideanick/tools/gen0/pluginsManager"
import { Gen0Utils } from "@ideanick/tools/gen0/utils"

export class Gen0Client {
  static logger = Gen0Logger.create1("client")
  logger = Gen0Client.logger

  config: Gen0Config
  file: Gen0File
  name: string
  pluginsManager: Gen0PluginsManager

  private constructor({
    filePath,
    config,
    name,
    pluginsManager,
  }: { filePath: string; config: Gen0Config; name?: string; pluginsManager: Gen0PluginsManager }) {
    this.config = config
    this.file = Gen0File.create({ filePath, config })
    this.name = name || this.file.path.rel
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

  async process() {
    const clientProcess = await Gen0ClientProcess.start({ client: this })
    return clientProcess
  }

  isSame(client: Gen0Client) {
    return this.file.path.abs === client.file.path.abs
  }

  isMatchGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    return this.file.fs.isPathMatchGlob(this.file.path.abs, clientsGlob)
  }

  isMatchName(nameSearch: Gen0Utils.Search) {
    return Gen0Utils.isStringMatch(this.name, nameSearch)
  }

  getMeta(): Gen0Client.Meta {
    return {
      name: this.name,
      path: this.file.path.rel,
    }
  }
}

export namespace Gen0Client {
  export type Meta = {
    name: string
    path: string
  }
}
