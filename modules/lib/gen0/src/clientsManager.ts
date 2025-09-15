import type { Fs0 } from '@devp0nt/fs0'
import { Gen0Client } from './client'
import type { Gen0Config } from './config'
import { Gen0Logger } from './logger'
import type { Gen0PluginsManager } from './pluginsManager'
import { Gen0Target } from './target'

export class Gen0ClientsManager {
  static logger = Gen0Logger.create('clientsManager')
  logger = Gen0ClientsManager.logger

  config: Gen0Config
  fs0: Fs0
  clients: Gen0Client[] = []
  pluginsManager: Gen0PluginsManager

  constructor({ config, fs0, pluginsManager }: { config: Gen0Config; fs0: Fs0; pluginsManager: Gen0PluginsManager }) {
    this.config = config
    this.fs0 = fs0
    this.pluginsManager = pluginsManager
  }

  static create({ config, fs0, pluginsManager }: { config: Gen0Config; fs0: Fs0; pluginsManager: Gen0PluginsManager }) {
    return new Gen0ClientsManager({ config, fs0, pluginsManager })
  }

  async add(clients: Gen0Client[], withDryRun: boolean = false) {
    for (const newClient of clients) {
      const exClientIndex = this.clients.findIndex((exClient) => newClient.isSame(exClient))
      if (exClientIndex === -1) {
        if (withDryRun) {
          await newClient.process({ dryRun: true })
        }
        this.clients.push(newClient)
        this.logger.debug(`add client ${newClient.file0.path.rel}`)
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
    this.logger.debug(`replace client ${client.file0.path.rel}`)
  }

  async addByGlob(glob: Fs0.PathOrPaths, withDryRun: boolean = false) {
    glob = this.fs0.toPathsAbs(glob)
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

  removeByGlob(clientsGlob: Fs0.PathOrPaths) {
    const removedClients: typeof this.clients = []
    for (const client of this.clients) {
      if (this.fs0.isPathMatchGlob(client.file0.path.abs, clientsGlob)) {
        removedClients.push(client)
      }
    }
    return this.remove(removedClients)
  }

  removeByPath(path: string) {
    const removedClients: typeof this.clients = []
    for (const client of this.clients) {
      if (client.file0.path.abs === path) {
        removedClients.push(client)
      }
    }
    return this.remove(removedClients)
  }

  removeByName(nameSearch: Fs0.StringMatchInput) {
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
      this.logger.debug(`remove client ${client.file0.path.rel}`)
    }
    return clients
  }

  getByPath(path: string) {
    return this.clients.find((c) => c.file0.path.abs === path)
  }

  getByGlob(clientsGlob: Fs0.PathOrPaths) {
    return this.clients.find((c) => c.isMatchGlob(clientsGlob))
  }

  getByName(nameSearch: Fs0.StringMatchInput) {
    return this.clients.filter((c) => c.isMatchName(nameSearch))
  }

  getByDir(dir: string) {
    return this.clients.filter((c) => this.fs0.isPathInDir(c.file0.path.abs, dir))
  }

  async processMany(clients: Gen0Client[], dryRun: boolean = false) {
    return await Promise.all(clients.map((client) => client.process({ dryRun })))
  }

  async processManyByNames(name: Fs0.StringMatchInput, dryRun: boolean = false) {
    const clients = this.getByName(name)
    return await this.processMany(clients, dryRun)
  }

  async processAll(dryRun: boolean = false) {
    return await this.processMany(this.clients, dryRun)
  }

  async findAndCreateManyByGlob(clientsGlob: Fs0.PathOrPaths) {
    const clientsPaths = await this.fs0.globContentMatch(clientsGlob, [Gen0Target.startMark, Gen0Target.silentMark])
    return await Promise.all(
      clientsPaths.map((filePath) =>
        Gen0Client.create({ filePath, config: this.config, pluginsManager: this.pluginsManager }),
      ),
    )
  }

  async findAndCreateManyByPath(path: Fs0.PathOrPaths) {
    const clientsPaths = await this.fs0.ensureFilesContentMatch(path, [Gen0Target.startMark, Gen0Target.silentMark])
    return await Promise.all(
      clientsPaths.map((filePath) =>
        Gen0Client.create({ filePath, config: this.config, pluginsManager: this.pluginsManager }),
      ),
    )
  }

  async findAndCreateAll() {
    return await this.findAndCreateManyByGlob(this.config.clientsGlob)
  }

  async findAndProcessManyByGlob(clientsGlob: Fs0.PathOrPaths) {
    const clients = await this.findAndCreateManyByGlob(clientsGlob)
    return await this.processMany(clients)
  }

  async findAndProcessAll() {
    return await this.findAndProcessManyByGlob(this.config.clientsGlob)
  }

  isSame(client1: Gen0Client, client2: Gen0Client) {
    return client1.isSame(client2)
  }

  isMatchGlob(client: Gen0Client, clientsGlob: Fs0.PathOrPaths) {
    return client.isMatchGlob(clientsGlob)
  }

  isMatchName(client: Gen0Client, nameSearch: Fs0.StringMatchInput) {
    return client.isMatchName(nameSearch)
  }

  getClientsMeta(): Gen0ClientsManager.ClientsMeta {
    return this.clients.map((client) => client.getMeta())
  }
}

export namespace Gen0ClientsManager {
  export type ClientsMeta = Gen0Client.Meta[]
}
