import { execSync } from "node:child_process"
import type { Fs0 } from "@devp0nt/fs0"
import { Gen0 } from "@devp0nt/gen0"
import { Mono0Config } from "./config"
import { Mono0Logger } from "./logger"
import { Mono0PackageJson } from "./packageJson"
import { Mono0Tsconfig } from "./tsconfig"
import { Mono0Unit } from "./unit"
import watcherGen0 from "./watcher-gen0"

// TODO: should force js extension? ...
// TODO: mono0 run --filter X command
// TODO: build sequntially
// TODO: modules/{trpc,idea,...}/{backend,site,shared}
// TODO: mono0.getFilePathWithPackageName + gen0 importFromFiles
// TODO: мэниконфиг

// TODO: other модуль для ленивых
// TODO: валдатор циклических зависимостей
// TODO: валдатор одинаковых имён юнитов

// TODO: авто разруливание заисимостей в include, вместо refrenece
// TODO: верный package.json export dists путь при include не src, а что-то родительское
// TODO: settings

// TODO: ? mono0 генератор biome restrict imports
// TODO: ? автоинстал зависимостей исходя из импортов в коде
// TODO: ? exprimental В моно зеро возможность каждому файлу быть модулем

export class Mono0 {
  rootFs0: Fs0
  config: Mono0Config
  units: Mono0Unit[]
  logger: Mono0Logger = Mono0Logger.create("core")

  private constructor({ rootFs0, config, units }: { rootFs0: Fs0; config: Mono0Config; units: Mono0Unit[] }) {
    this.rootFs0 = rootFs0
    this.config = config
    this.units = units
  }

  static async create() {
    const config = await Mono0Config.get()
    const rootFs0 = config.rootFs0
    const units = await Mono0Unit.findAndCreateUnits({ rootFs0, config })
    return new Mono0({ rootFs0, config, units })
  }

  async refresh() {
    this.config = await Mono0Config.get()
    this.rootFs0 = this.config.rootFs0
    this.units = await Mono0Unit.findAndCreateUnits({ rootFs0: this.rootFs0, config: this.config })
    return this
  }

  async sync() {
    await Mono0Tsconfig.writeBaseTsconfig({
      tsconfig: this.config.tsconfigs.base,
      config: this.config,
      units: this.units,
    })
    await Mono0Tsconfig.writeRootTsconfig({
      tsconfig: this.config.tsconfigs.root,
      config: this.config,
      units: this.units,
    })
    await Mono0PackageJson.writeRootPackageJson({ config: this.config, units: this.units })
    for (const [tsconfigName, tsconfig] of Object.entries(this.config.tsconfigs)) {
      if (tsconfigName === "root" || tsconfigName === "base") {
        continue
      }
      await tsconfig.write({ units: this.units })
    }
    let packageJsonsDepsChanged = false
    for (const unit of this.units) {
      await unit.writeTsconfig({ units: this.units })
      const { depsChanged } = await unit.writePackageJson()
      packageJsonsDepsChanged = packageJsonsDepsChanged || depsChanged
    }
    if (packageJsonsDepsChanged && this.config.settings.installCommand) {
      try {
        execSync(this.config.settings.installCommand, { cwd: this.rootFs0.cwd, stdio: "inherit" })
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
