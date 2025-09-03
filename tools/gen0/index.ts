import { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0ClientsManager } from "@ideanick/tools/gen0/clientsManager"
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
  clientsManager: Gen0ClientsManager
  config: Gen0Config
  fs: Gen0Fs

  private constructor({
    config,
    fs,
    clientsManager,
  }: { config: Gen0Config; fs: Gen0Fs; clientsManager: Gen0ClientsManager }) {
    this.config = config
    this.fs = fs
    this.clientsManager = clientsManager
  }

  static async init({ cwd }: { cwd?: string } = {}) {
    const config = await Gen0Config.create({ cwd: cwd || process.cwd() })
    const fs = Gen0Fs.create({ config, cwd: config.rootDir })
    const plugins = await Gen0Plugin.findAndCreateAll({ fs, config })
    Gen0Plugin.assignPluginsToConfig({ config, plugins })
    const clientsManager = await Gen0ClientsManager.create({ fs, config })
    const gen0 = new Gen0({ config, fs, clientsManager })
    return gen0
  }
}

export namespace Gen0 {}
