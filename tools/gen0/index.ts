import { Gen0ClientsManager } from "@ideanick/tools/gen0/clientsManager"
import { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import { Gen0PluginsManager } from "@ideanick/tools/gen0/pluginsManager"
import { Gen0WatchersManager } from "@ideanick/tools/gen0/watchersManager"

// TODO: self watched clients
// TODO: generate react router

// TODO: named actions
// TODO: commander actions by action name

// TODO: self named clients
// TODO: commander actions by action or client name
// TODO: on init dry run without write, to get self called clients functions results

// TODO: add delay for watcher after write in file for this file watching
// TODO: better usage of logger0

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
  static logger = Gen0Logger.create("core")
  logger = Gen0.logger

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

  static async create({ cwd, debug = Gen0Config.defaultDebug }: { cwd?: string; debug?: string | boolean } = {}) {
    Gen0Logger.init(debug)
    const config = await Gen0Config.create({ cwd: cwd || process.cwd() })
    if (debug !== config.debug) {
      Gen0Logger.init(config.debug)
    }
    const fs = Gen0Fs.create({ config, cwd: config.rootDir })
    const pluginsManager = await Gen0PluginsManager.create({ fs, config })
    const clientsManager = await Gen0ClientsManager.create({ fs, config, pluginsManager })
    const watchersManager = await Gen0WatchersManager.create({
      fs,
      config,
      pluginsManager,
      clientsManager,
    })
    const gen0 = new Gen0({ config, fs, clientsManager, pluginsManager, watchersManager })
    this.logger.debug("gen0 created")
    return gen0
  }

  async init() {
    await this.clientsManager.addAll()
    await this.pluginsManager.addAll()
    await this.watchersManager.addAll()
  }
}

export namespace Gen0 {}
