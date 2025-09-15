import { Fs0 } from '@devp0nt/fs0'
import { Gen0ClientsManager } from './clientsManager'
import { Gen0Config } from './config'
import { Gen0Logger } from './logger'
import { Gen0PluginsManager } from './pluginsManager'
import { Gen0WatchersManager } from './watchersManager'

// TODO: gen0 code split, just add comment to which workspace or file code should come
// TODO: gen0 one env, one file, all env files
// TODO: plugin watcher can change self watching files, like mono0 wants
// TODO: self watch client always
// TODO: В ген0 не делать так нагло сам клиент плагином. Достаточно вотчеры добавить
// TODO: Ген0 плагин инит и процесс раздельно
// TODO: fs → ffs (find existing lib)
// TODO: В хук вотчера передавать также статы по файлу, это была папка или файл, и вообще передавать туда всё объектом
// TODO: В плагин предавать логгер, который имеет свой тег
// TODO: Переименовать инит на процесс для плагинов, и тогда всё будет консистентно
// TODO: реакт роутер пути генерироваьт не через / а по папочкам
// TODO: реакт роутер страницы ипортировать именованными
// TODO: Драйран в аргументе передавать не булеаном, а строкой ран тайп или нул
// TODO: Процесс получив путь к плагину сделает плагин процесс, а к файлу, файл процесс
// TODO: Процесс переименовать на ран чтобы не использовать лишнее слово
// TODO: Гитигнор файлы и их пути кешировать, а после перезапускать вотчер если они поменялись
// TODO: Не переписывать файл, если посимвольно он без изменений
// TODO: Сделать чтобы было нормально для при вотче собственного пути
// TODO: Кастомные суффиксы для комментариев gen0:start, gen0:end, gen0:silent
// TODO: on plugin iside error not fail, just console log
// TODO: sound on error
// TODO: rootFs to fs
// TODO: config scanLocalPlugins
// TODO: config autoImportInstalledPlugins

// TODO: generate react router
// TODO: p command in watch, should also restart init commands of plugins, or somehow

// TODO: silent comments
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
// TODO: importFromFiles → importNamed, importSimple, importDefault, importAs
// TODO: importNamed → match not ends, matched not cutted

// TODO: boime ignore organize imports
// TODO: prinst space count default
// TODO: bin to bin in package.json
// TODO: prevent double watch process
// TODO: dry run on init, or not dry run on init as arg and option
// TODO: onInit plugin ctx shul recieve dry run
// TODO: алерты при регенерации файлов
// TODO: Инверсионная подсветка ген0

export class Gen0 {
  static logger = Gen0Logger.create('core')
  logger = Gen0.logger

  clientsManager: Gen0ClientsManager
  pluginsManager: Gen0PluginsManager
  watchersManager: Gen0WatchersManager
  config: Gen0Config
  fs0: Fs0

  private constructor({
    config,
    fs0,
    clientsManager,
    pluginsManager,
    watchersManager,
  }: {
    config: Gen0Config
    fs0: Fs0
    clientsManager: Gen0ClientsManager
    pluginsManager: Gen0PluginsManager
    watchersManager: Gen0WatchersManager
  }) {
    this.config = config
    this.fs0 = fs0
    this.clientsManager = clientsManager
    this.pluginsManager = pluginsManager
    this.watchersManager = watchersManager
  }

  static async create({
    cwd,
    debug = Gen0Config.defaultDebug,
    configPath,
    configDefinition,
  }: {
    cwd?: string
    debug?: string | boolean
    configPath?: string
    configDefinition?: Gen0Config.Definition
  } = {}) {
    Gen0Logger.init(debug)
    const config = await Gen0Config.create({ cwd: cwd || process.cwd(), configPath, configDefinition })
    if (debug !== config.debug) {
      Gen0Logger.init(config.debug)
    }
    const fs0 = Fs0.create({ rootDir: config.rootDir, cwd: config.rootDir })
    const pluginsManager = await Gen0PluginsManager.create({ fs0, config })
    const clientsManager = await Gen0ClientsManager.create({ fs0, config, pluginsManager })
    const watchersManager = await Gen0WatchersManager.create({
      fs0,
      config,
      pluginsManager,
      clientsManager,
    })
    const gen0 = new Gen0({ config, fs0, clientsManager, pluginsManager, watchersManager })
    this.logger.debug('gen0 created')
    return gen0
  }

  async init({ dryRun }: { dryRun: boolean } = { dryRun: false }) {
    await this.clientsManager.addAll()
    await this.pluginsManager.addAll()
    await this.clientsManager.processAll(dryRun)
    await this.pluginsManager.initAll()
  }

  async watch() {
    await this.watchersManager.watchAllByParcel()
  }
}

export namespace Gen0 {}
