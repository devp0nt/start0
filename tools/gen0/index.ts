import { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0ClientsManager } from "@ideanick/tools/gen0/clientsManager"
import { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import { Gen0PluginsManager } from "@ideanick/tools/gen0/pluginsManager"

// Вотчер берёт клиентс глоб и клиентс нэймс
// При запуске вотчера делаем первый прогон клиентов, и таким образом собираем из них спмодекларации
// on init, делаем драй ран, где в клиентах не переписываем файлы, но также собираем все декларации

// TODO: watchers
// TODO: named actions
// TODO: commander actions

// TODO: self named clients
// TODO: self watched clients

// TODO: commander actions and clients anmes, and client paths
// TODO: add logger
// TODO: plugin on init

// TODO: multiline comments
// TODO: silent comments
// TODO: importFromFiles → importNamed, importSimple, importDefault, importAs
// TODO: importNamed → match not ends, matched not cutted

// TODO: boime ignore organize imports
// TODO: prinst space count default
// TODO: bin to bin in package.json

export class Gen0 {
  clientsManager: Gen0ClientsManager
  pluginsManager: Gen0PluginsManager
  config: Gen0Config
  fs: Gen0Fs

  private constructor({
    config,
    fs,
    clientsManager,
    pluginsManager,
  }: { config: Gen0Config; fs: Gen0Fs; clientsManager: Gen0ClientsManager; pluginsManager: Gen0PluginsManager }) {
    this.config = config
    this.fs = fs
    this.clientsManager = clientsManager
    this.pluginsManager = pluginsManager
  }

  static async create({ cwd }: { cwd?: string } = {}) {
    const config = await Gen0Config.create({ cwd: cwd || process.cwd() })
    const fs = Gen0Fs.create({ config, cwd: config.rootDir })
    const pluginsManager = await Gen0PluginsManager.create({ fs, config })
    const clientsManager = await Gen0ClientsManager.create({ fs, config, pluginsManager })
    const gen0 = new Gen0({ config, fs, clientsManager, pluginsManager })
    return gen0
  }

  async init() {
    await this.clientsManager.addAll()
    await this.pluginsManager.addAll()
  }
}

export namespace Gen0 {}
