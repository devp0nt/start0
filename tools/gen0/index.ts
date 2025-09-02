import { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

// TODO: named actions
// TODO: plugin inport from files
// TODO: export name without ending
// TODO: remove forced new line after first comment
// TODO: boime ignore organize imports
// TODO: watchers
// TODO: typed ctx
// TODO: better parsing, and spaces before finish
// TODO: check if we need static props at all
// TODO: bin file
// TODO: find all files using
// TODO: add logger
// TODO: project root in config
// TODO: many config extensions
// TODO: runner as class
// TODO: plugin as class
// TODO: bin to bin in package.json
// TODO: respect nodepath in globs
// TODO: print inline
// TODO: prim space count

export class Gen0 {
  clients: Gen0Client[] = []
  config: Gen0Config
  fs: Gen0Fs

  private constructor({ config, fs, clients }: { config: Gen0Config; fs: Gen0Fs; clients: Gen0Client[] }) {
    this.config = config
    this.fs = fs
    this.clients = clients
  }

  static async init({ cwd }: { cwd?: string } = {}) {
    const config = await Gen0Config.create({ cwd: cwd || process.cwd() })
    const fs = Gen0Fs.create({ config, cwd: config.rootDir })
    const plugins = await Gen0Plugin.findAndCreateAll({ fs, config })
    Gen0Plugin.assignPluginsToConfig({ config, plugins })
    const clients = await Gen0Client.findAndCreateAll({ fs, config })
    const gen0 = new Gen0({ config, fs, clients })
    return gen0
  }

  removeClient(client: Gen0Fs.Path): void
  removeClient(client: Gen0Fs.Paths): void
  removeClient(client: Gen0Client): void
  removeClient(client: Gen0Client[]): void
  removeClient(client: Gen0Fs.Path | Gen0Fs.Paths | Gen0Client | Gen0Client[]) {
    const clientsPaths = Array.isArray(client)
      ? client.map((c) => (typeof c === "string" ? c : c.file.path.abs))
      : [typeof client === "string" ? client : client.file.path.abs]
    this.clients = this.clients.filter((c) => !clientsPaths.includes(c.file.path.abs))
  }

  addClient(path: Gen0Fs.Path): void
  addClient(path: Gen0Fs.Paths): void
  addClient(path: Gen0Fs.Path | Gen0Fs.Paths) {
    const clients = Array.isArray(path)
      ? path.map((p) => Gen0Client.create({ filePath: p, config: this.config }))
      : [Gen0Client.create({ filePath: path, config: this.config })]
    this.clients.push(...clients)
  }

  async processClients() {
    return await Gen0Client.processMany(this.clients)
  }

  async processFile(filePath: string) {
    const client = Gen0Client.create({ filePath, config: this.config })
    return await client.process()
  }

  async processFiles(clientsGlob: Gen0Config["clients"]) {
    const clients = await Gen0Client.findAndCreateAll({ fs: this.fs, config: this.config, clientsGlob })
    return await Gen0Client.processMany(clients)
  }
}

export namespace Gen0 {}
