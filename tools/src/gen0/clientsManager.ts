import { Gen0Client } from "@/tools/gen0/client"
import type { Gen0Config } from "@/tools/gen0/config"
import type { Gen0Fs } from "@/tools/gen0/fs"
import { Gen0Logger } from "@/tools/gen0/logger"
import type { Gen0PluginsManager } from "@/tools/gen0/pluginsManager"
import { Gen0Target } from "@/tools/gen0/target"
import type { Gen0Utils } from "@/tools/gen0/utils"

export class Gen0ClientsManager {
  static logger = Gen0Logger.create("clientsManager")
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

  async add(clients: Gen0Client[], withDryRun: boolean = false) {
    for (const newClient of clients) {
      const exClientIndex = this.clients.findIndex((exClient) => newClient.isSame(exClient))
      if (exClientIndex === -1) {
        if (withDryRun) {
          await newClient.process({ dryRun: true })
        }
        this.clients.push(newClient)
        this.logger.debug(`add client ${newClient.file.path.rel}`)
      } else {
        await this.replace(newClient, exClientIndex, withDryRun)
      }
    }
    return clients
  }

  async replace(client: Gen0Client, index: number, withDryRun: boolean = false) {
    const oldClient = this.clients[index]
    if (!oldClient) {
      this.add([client])
      return
    }
    await oldClient.removeSelfPlugin()
    if (withDryRun) {
      await client.process({ dryRun: true })
    }
    await client.applySelfPlugin()
    this.clients[index] = client
    this.logger.debug(`replace client ${client.file.path.rel}`)
  }

  async addByGlob(glob: Gen0Fs.PathOrPaths, withDryRun: boolean = false) {
    glob = this.fs.toPaths(glob)
    const clients = await this.findAndCreateManyByGlob(glob)
    return this.add(clients, withDryRun)
  }

  async addByPath(path: string, withDryRun: boolean = false) {
    const clients = await this.findAndCreateManyByPath(path)
    return this.add(clients, withDryRun)
  }

  async addAll(withDryRun: boolean = false) {
    return await this.addByGlob(this.config.clientsGlob, withDryRun)
  }

  removeByGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    const removedClients: typeof this.clients = []
    for (const client of this.clients) {
      if (this.fs.isPathMatchGlob(client.file.path.abs, clientsGlob)) {
        removedClients.push(client)
      }
    }
    return this.remove(removedClients)
  }

  removeByPath(path: string) {
    const removedClients: typeof this.clients = []
    for (const client of this.clients) {
      if (client.file.path.abs === path) {
        removedClients.push(client)
      }
    }
    return this.remove(removedClients)
  }

  removeByName(nameSearch: Gen0Utils.Search) {
    const removedClients: typeof this.clients = []
    for (const client of this.clients) {
      if (client.isMatchName(nameSearch)) {
        removedClients.push(client)
      }
    }
    return this.remove(removedClients)
  }

  async remove(clients: Gen0Client[]) {
    for (const client of clients) {
      await client.removeSelfPlugin()
    }
    this.clients = this.clients.filter((client) => clients.every((c) => !c.isSame(client)))
    for (const client of clients) {
      this.logger.debug(`remove client ${client.file.path.rel}`)
    }
    return clients
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

  async processMany(clients: Gen0Client[], dryRun: boolean = false) {
    return await Promise.all(clients.map((client) => client.process({ dryRun })))
  }

  async processManyByNames(name: Gen0Utils.Search, dryRun: boolean = false) {
    const clients = this.getByName(name)
    return await this.processMany(clients, dryRun)
  }

  async processAll(dryRun: boolean = false) {
    return await this.processMany(this.clients, dryRun)
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
