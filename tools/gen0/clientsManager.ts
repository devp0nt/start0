import { Gen0Client } from "@ideanick/tools/gen0/client"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Target } from "@ideanick/tools/gen0/target"

export class Gen0ClientsManager {
  config: Gen0Config
  fs: Gen0Fs
  clients: Gen0Client[] = []

  constructor({ config, fs }: { config: Gen0Config; fs: Gen0Fs }) {
    this.config = config
    this.fs = fs
  }

  static create({ config, fs }: { config: Gen0Config; fs: Gen0Fs }) {
    return new Gen0ClientsManager({ config, fs })
  }

  addClients(clients: Gen0Client[]) {
    const filteredClients = clients.filter((c1) => !this.clients.some((c2) => this.isSame(c1, c2)))
    this.clients.push(...filteredClients)
    return filteredClients
  }

  async addClientsByGlob(glob: Gen0Fs.PathOrPaths) {
    glob = this.fs.toPaths(glob)
    const clients = await this.findAndCreateMany(glob)
    return this.addClients(clients)
  }

  removeClientsByGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    const clientsEntries = this.clients.map((c, index) => ({
      index,
      client: c,
    }))
    const removedClientsEntries = clientsEntries.filter(
      ({ client }) => !this.fs.isPathMatchGlob(client.file.path.abs, clientsGlob),
    )
    for (const { index } of removedClientsEntries) {
      this.clients.splice(index, 1)
    }
    return removedClientsEntries.map(({ client }) => client)
  }

  removeClientsByName(nameSearch: Gen0Fs.Search) {
    const clientsEntries = this.clients.map((c, index) => ({
      index,
      client: c,
    }))
    const removedClientsEntries = clientsEntries.filter(({ client }) => client.isMatchName(nameSearch))
    for (const { index } of removedClientsEntries) {
      this.clients.splice(index, 1)
    }
    return removedClientsEntries.map(({ client }) => client)
  }

  getClientsByGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    return this.clients.find((c) => c.isMatchGlob(clientsGlob))
  }

  getClientsByName(nameSearch: Gen0Fs.Search) {
    return this.clients.filter((c) => c.isMatchName(nameSearch))
  }

  async processMany(clients: Gen0Client[]) {
    return await Promise.all(clients.map((client) => client.process()))
  }

  async processAll() {
    return await this.processMany(this.clients)
  }

  async findAndCreateMany(clientsGlob: Gen0Fs.PathOrPaths) {
    const clientsPaths = await this.fs.findFilesPathsContentMatch({
      glob: clientsGlob,
      search: [Gen0Target.startMark, Gen0Target.silentMark],
    })
    return await Promise.all(clientsPaths.map((filePath) => Gen0Client.create({ filePath, config: this.config })))
  }

  async findAndCreateAll() {
    return await this.findAndCreateMany(this.config.clientsGlob)
  }

  async findAndProcessMany(clientsGlob: Gen0Fs.PathOrPaths) {
    const clients = await this.findAndCreateMany(clientsGlob)
    return await this.processMany(clients)
  }

  async findAndProcessAll() {
    return await this.findAndProcessMany(this.config.clientsGlob)
  }

  isSame(client1: Gen0Client, client2: Gen0Client) {
    return client1.isSame(client2)
  }

  isMatchGlob(client: Gen0Client, clientsGlob: Gen0Fs.PathOrPaths) {
    return client.isMatchGlob(clientsGlob)
  }

  isMatchName(client: Gen0Client, nameSearch: Gen0Fs.Search) {
    return client.isMatchName(nameSearch)
  }
}
