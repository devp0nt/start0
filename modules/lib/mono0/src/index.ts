import { execSync } from "node:child_process"
import type { Fs0 } from "@devp0nt/fs0"
import { Gen0 } from "@devp0nt/gen0"
import { Mono0Config } from "./config"
import { Mono0Logger } from "./logger"
import { Mono0PackageJson } from "./packageJson"
import { Mono0Tsconfig } from "./tsconfig"
import { Mono0Unit } from "./unit"
import watcherGen0 from "./watcher-gen0"

// TODO: deepDeps filter
// TODO: preset cold: tag #cold, do not add paths to tsconfig, by filtering

// TODO: tsconfigBuild where I disbale all paths so original dist wil be used
// TODO: mono0 run --filter X command
// TODO: build sequntially or fix build script, noEmitOnError: true

// TODO: ? мэниконфиг
// TODO: ? https://www.npmjs.com/package/tsc-esm-fix
// TODO: ? https://www.npmjs.com/package/tsc-watch
// TODO: ? tsc-esm-fix to watcher

// TODO: опицональный packageJson
// TODO: ? опицональный tsconfig

// TODO: other модуль для ленивых
// TODO: валдатор циклических зависимостей
// TODO: валдатор одинаковых имён юнитов
// TODO: валдатор одинаковых путей файлов

// TODO: тип зависимости none
// TODO: и поэтому собственный билд через tsup, сначала одну билдим, потом другую, потом первую с референсами, потом вторую с референсами
// TODO: авто разруливание заисимостей в include, вместо refrenece
// TODO: верный package.json export dists путь при include не src, а что-то родительское
// TOOD: Тсконфиг может быть анконтроллед, тогда просто берётся его значение из пути

// TODO: ? mono0 генератор biome restrict imports
// TODO: ? автоинстал зависимостей исходя из импортов в коде
// TODO: ? exprimental В моно зеро возможность каждому файлу быть модулем

export class Mono0 {
  rootFs0: Fs0
  generalTsconfigs: Mono0Tsconfig[]
  generalPackageJson: Mono0PackageJson
  config: Mono0Config
  units: Mono0Unit[]
  logger: Mono0Logger = Mono0Logger.create("core")

  private constructor({
    rootFs0,
    config,
    units,
    generalTsconfigs,
    generalPackageJson,
  }: {
    rootFs0: Fs0
    config: Mono0Config
    units: Mono0Unit[]
    generalTsconfigs: Mono0Tsconfig[]
    generalPackageJson: Mono0PackageJson
  }) {
    this.rootFs0 = rootFs0
    this.config = config
    this.units = units
    this.generalTsconfigs = generalTsconfigs
    this.generalPackageJson = generalPackageJson
  }

  static async getCreateParams() {
    const config = await Mono0Config.get()
    const generalTsconfigs = Mono0Tsconfig.createGeneralsByConfig(config)
    const generalPackageJson = Mono0PackageJson.create({
      definition: config.packageJson,
      config,
      fs0: config.configFs0,
    })
    const rootFs0 = config.rootFs0
    const units = await Mono0Unit.findAndCreateUnits({ rootFs0, config, generalTsconfigs })
    return { config, generalTsconfigs, generalPackageJson, rootFs0, units }
  }

  static async create() {
    const { config, generalTsconfigs, generalPackageJson, rootFs0, units } = await Mono0.getCreateParams()
    return new Mono0({ rootFs0, config, units, generalTsconfigs, generalPackageJson })
  }

  async refresh() {
    const { config, generalTsconfigs, generalPackageJson, rootFs0, units } = await Mono0.getCreateParams()
    this.config = config
    this.generalTsconfigs = generalTsconfigs
    this.generalPackageJson = generalPackageJson
    this.rootFs0 = rootFs0
    this.units = units
    return this
  }

  async sync() {
    await this.generalPackageJson.write({ units: this.units })
    for (const tsconfig of this.generalTsconfigs) {
      await tsconfig.write({ units: this.units })
    }
    let packageJsonsDepsChanged = false
    for (const unit of this.units) {
      await unit.writeTsconfigs({ units: this.units })
      const { depsChanged } = await unit.writePackageJson({ units: this.units })
      packageJsonsDepsChanged = packageJsonsDepsChanged || depsChanged
    }
    if (packageJsonsDepsChanged && this.config.settings.onPackageJsonsDepsChangedCommand) {
      try {
        execSync(this.config.settings.onPackageJsonsDepsChangedCommand, { cwd: this.rootFs0.cwd, stdio: "inherit" })
        this.logger.debug(`dependencies installed for "${this.rootFs0.cwd}"`)
      } catch (error) {
        this.logger.error(`failed to install dependencies for "${this.rootFs0.cwd}"`, { error })
      }
    }
  }
  static async sync({ mono0 }: { mono0?: Mono0 } = {}) {
    if (!mono0) {
      mono0 = await Mono0.create()
    }
    await mono0.sync()
  }

  getFilePathRelativeToPackageName(absFilePath: string) {
    return Mono0Unit.getFilePathRelativeToPackageName({ absFilePath, units: this.units })
  }

  async watch() {
    const gen0 = await Gen0.create({
      configDefinition: {
        rootDir: this.config.rootFs0.rootDir,
        pluginsGlob: [],
        clientsGlob: [],
        debug: true,
        plugins: [watcherGen0],
      },
    })
    await gen0.init()
    const watcher = await gen0.watch()
    return watcher
  }
}
