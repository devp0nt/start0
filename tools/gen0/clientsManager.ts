import { Gen0Client } from "@ideanick/tools/gen0/client"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import type { Gen0PluginsManager } from "@ideanick/tools/gen0/pluginsManager"
import { Gen0Target } from "@ideanick/tools/gen0/target"
import type { Gen0Utils } from "@ideanick/tools/gen0/utils"

export class Gen0ClientsManager {
  static logger = Gen0Logger.create1("clientsManager")
  logger = Gen0ClientsManager.logger

  config: Gen0Config
  fs: Gen0Fs
  clients: Gen0Client[] = []
  pluginsManager: Gen0PluginsManager

  constructor({ config, fs, pluginsManager }: { config: Gen0Config; fs: Gen0Fs; pluginsManager: Gen0PluginsManager }) {
    this.config = config
    this.fs = fs
    this.pluginsManager = pluginsManager
  }

  static create({
    config,
    fs,
    pluginsManager,
  }: {
    config: Gen0Config
    fs: Gen0Fs
    pluginsManager: Gen0PluginsManager
  }) {
    return new Gen0ClientsManager({ config, fs, pluginsManager })
  }

  add(clients: Gen0Client[]) {
    const filteredClients = clients.filter((c1) => !this.clients.some((c2) => this.isSame(c1, c2)))
    this.clients.push(...filteredClients)
    return filteredClients
  }

  async addByGlob(glob: Gen0Fs.PathOrPaths) {
    glob = this.fs.toPaths(glob)
    const clients = await this.findAndCreateManyByGlob(glob)
    return this.add(clients)
  }

  async addByPath(path: string) {
    const clients = await this.findAndCreateManyByPath(path)
    return this.add(clients)
  }

  async addAll() {
    return await this.addByGlob(this.config.clientsGlob)
  }

  removeByGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    const removedClients: typeof this.clients = []
    this.clients = this.clients.filter((client) => {
      const shouldKeep = this.fs.isPathMatchGlob(client.file.path.abs, clientsGlob)
      if (!shouldKeep) {
        removedClients.push(client)
      }
      return shouldKeep
    })
    return removedClients
  }

  removeByPath(path: string) {
    const removedClients: typeof this.clients = []
    this.clients = this.clients.filter((client) => {
      const shouldKeep = client.file.path.abs !== path
      if (!shouldKeep) {
        removedClients.push(client)
      }
      return shouldKeep
    })
    return removedClients
  }

  removeByName(nameSearch: Gen0Utils.Search) {
    const removedClients: typeof this.clients = []
    this.clients = this.clients.filter((client) => {
      const shouldKeep = !client.isMatchName(nameSearch)
      if (!shouldKeep) {
        removedClients.push(client)
      }
      return shouldKeep
    })
    return removedClients
  }

  getByPath(path: string) {
    return this.clients.find((c) => c.file.path.abs === path)
  }

  getByGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    return this.clients.find((c) => c.isMatchGlob(clientsGlob))
  }

  getByName(nameSearch: Gen0Utils.Search) {
    return this.clients.filter((c) => c.isMatchName(nameSearch))
  }

  getByDir(dir: string) {
    return this.clients.filter((c) => this.fs.isPathInDir(c.file.path.abs, dir))
  }

  async processMany(clients: Gen0Client[]) {
    return await Promise.all(clients.map((client) => client.process()))
  }

  async processManyByNames(name: Gen0Utils.Search) {
    const clients = this.getByName(name)
    return await this.processMany(clients)
  }

  async processAll() {
    return await this.processMany(this.clients)
  }

  async findAndCreateManyByGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    const clientsPaths = await this.fs.findFilesPathsContentMatch({
      glob: clientsGlob,
      search: [Gen0Target.startMark, Gen0Target.silentMark],
    })
    return await Promise.all(
      clientsPaths.map((filePath) =>
        Gen0Client.create({ filePath, config: this.config, pluginsManager: this.pluginsManager }),
      ),
    )
  }

  async findAndCreateManyByPath(path: Gen0Fs.PathOrPaths) {
    const clientsPaths = await this.fs.ensureFilesPathsContentMatch({
      path,
      search: [Gen0Target.startMark, Gen0Target.silentMark],
    })
    return await Promise.all(
      clientsPaths.map((filePath) =>
        Gen0Client.create({ filePath, config: this.config, pluginsManager: this.pluginsManager }),
      ),
    )
  }

  async findAndCreateAll() {
    return await this.findAndCreateManyByGlob(this.config.clientsGlob)
  }

  async findAndProcessManyByGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    const clients = await this.findAndCreateManyByGlob(clientsGlob)
    return await this.processMany(clients)
  }

  async findAndProcessAll() {
    return await this.findAndProcessManyByGlob(this.config.clientsGlob)
  }

  isSame(client1: Gen0Client, client2: Gen0Client) {
    return client1.isSame(client2)
  }

  isMatchGlob(client: Gen0Client, clientsGlob: Gen0Fs.PathOrPaths) {
    return client.isMatchGlob(clientsGlob)
  }

  isMatchName(client: Gen0Client, nameSearch: Gen0Utils.Search) {
    return client.isMatchName(nameSearch)
  }

  getClientsMeta(): Gen0ClientsManager.ClientsMeta {
    return this.clients.map((client) => client.getMeta())
  }
}

export namespace Gen0ClientsManager {
  export type ClientsMeta = Gen0Client.Meta[]
}
