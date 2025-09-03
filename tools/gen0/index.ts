import { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

// Вотчер берёт клиентс глоб и клиентс нэймс
// Удален клиента по нейму и по глобу отдельно
// Конфиг берёт не клиентс, а клиентсглоб
// Гет клиент пас бай нейм
// ? Хранить вотчеры, функции, плагины, в массиве и тогда имена из файловвозьмутся, а в конфиге по ключам возьмём, и тип правильный не плагинс, а плагинсколлекшее
// При запуске вотчера делаем первый прогон клиентов, и таким образом собираем из них спмодекларации
// При запросе бин инфо, делаем драй ран, где в клиентах не переписываем файлы, но также собираем все декларации

// TODO: watchers
// TODO: named actions
// TODO: commander actions

// TODO: self named clients
// TODO: self watched clients

// TODO: commander actions and clients anmes, and client paths

// TODO: multiline comments
// TODO: silent comments
// TODO: importFromFiles → importNamed, importSimple, importDefault, importAs
// TODO: importNamed → match not ends, matched not cutted

// TODO: boime ignore organize imports
// TODO: add logger
// TODO: prinst space count default
// TODO: bin to bin in package.json

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
      ? client.map((c) => (typeof c === "string" ? this.fs.toAbs(c) : c.file.path.abs))
      : [typeof client === "string" ? this.fs.toAbs(client) : client.file.path.abs]
    this.clients = this.clients.filter((c) => !clientsPaths.includes(c.file.path.abs))
  }

  addClient(path: Gen0Fs.Path): void
  addClient(path: Gen0Fs.Paths): void
  addClient(path: Gen0Fs.Path | Gen0Fs.Paths) {
    const clients = Array.isArray(path)
      ? path.map((p) => Gen0Client.create({ filePath: p, config: this.config }))
      : [Gen0Client.create({ filePath: path, config: this.config })]
    const filteredClients = clients.filter((c) => !this.clients.some((cc) => Gen0Client.isSameClient(cc, c)))
    this.clients.push(...filteredClients)
  }

  getClient(path: Gen0Fs.Path): void
  getClient(path: Gen0Fs.Paths): void
  getClient(path: Gen0Fs.Path | Gen0Fs.Paths) {
    return this.clients.find((c) => this.fs.isPathMatchGlob(c.file.path.abs, path))
  }

  async processClients() {
    return await Gen0Client.processMany(this.clients)
  }

  async processFile(filePath: string) {
    const client = Gen0Client.create({ filePath, config: this.config })
    return await client.process()
  }

  async processFiles(clientsGlob: Gen0Config["clientsGlob"]) {
    const clients = await Gen0Client.findAndCreateAll({ fs: this.fs, config: this.config, clientsGlob })
    return await Gen0Client.processMany(clients)
  }
}

export namespace Gen0 {}
