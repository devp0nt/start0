import { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0ClientsManager } from "@ideanick/tools/gen0/clientsManager"
import { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import { Gen0PluginsManager } from "@ideanick/tools/gen0/pluginsManager"
import { Gen0WatchersManager } from "@ideanick/tools/gen0/watchersManager"

// TODO: watch for new clients
// TODO: watch for new plugins
// TODO: add logger

// TODO: watchers
// TODO: named actions
// TODO: commander actions

// TODO: self named clients
// TODO: self watched clients
// TODO:При запуске вотчера делаем первый прогон клиентов, и таким образом собираем из них спмодекларации
// TODO:on init, делаем драй ран, где в клиентах не переписываем файлы, но также собираем все декларации

// TODO: commander actions and clients anmes, and client paths
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
  watchersManager: Gen0WatchersManager
  config: Gen0Config
  fs: Gen0Fs

  private constructor({
    config,
    fs,
    clientsManager,
    pluginsManager,
    watchersManager,
  }: {
    config: Gen0Config
    fs: Gen0Fs
    clientsManager: Gen0ClientsManager
    pluginsManager: Gen0PluginsManager
    watchersManager: Gen0WatchersManager
  }) {
    this.config = config
    this.fs = fs
    this.clientsManager = clientsManager
    this.pluginsManager = pluginsManager
    this.watchersManager = watchersManager
  }

  static async create({ cwd }: { cwd?: string } = {}) {
    const config = await Gen0Config.create({ cwd: cwd || process.cwd() })
    const fs = Gen0Fs.create({ config, cwd: config.rootDir })
    const pluginsManager = await Gen0PluginsManager.create({ fs, config })
    const clientsManager = await Gen0ClientsManager.create({ fs, config, pluginsManager })
    const watchersManager = await Gen0WatchersManager.create({ fs, config, pluginsManager, clientsManager })
    const gen0 = new Gen0({ config, fs, clientsManager, pluginsManager, watchersManager })
    return gen0
  }

  async init() {
    await this.clientsManager.addAll()
    await this.pluginsManager.addAll()
    await this.watchersManager.addAll()
  }
}

export namespace Gen0 {}
