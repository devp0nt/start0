import { execSync } from "node:child_process"
import type { Fs0 } from "@devp0nt/fs0"
import { Gen0 } from "@devp0nt/gen0"
import { Mono0Config } from "@devp0nt/mono0/config"
import { Mono0Logger } from "@devp0nt/mono0/logger"
import { Mono0PackageJson } from "@devp0nt/mono0/packageJson"
import { Mono0Tsconfig } from "@devp0nt/mono0/tsconfig"
import { Mono0Unit } from "@devp0nt/mono0/unit"
import watcherGen0 from "@devp0nt/mono0/watcher-gen0"

// TODO: modules/{trpc,idea,...}/{backend,site,shared}
// TODO: верный package.json export dists путь
// TODO: other модуль для ленивых
// TODO: валдатор циклических зависимостей
// TODO: валдатор одинаковых имён юнитов
// TODO: fs0 withTsconfigPath → gen0 importFromFiles
// TODO: mono0 генератор jest file

// TODO: мэниконфиг
// TODO: авто разруливание заисимостей в include, вместо refrenece
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
    const units = await Mono0.findAndCreateUnits({ rootFs0, config })
    Mono0Unit.applyDeps({ units })
    return new Mono0({ rootFs0, config, units })
  }

  static async findAndCreateUnits({ rootFs0, config }: { rootFs0: Fs0; config: Mono0Config }) {
    const unitsConfigsPaths = await rootFs0.glob("**/mono0.json")
    if (!unitsConfigsPaths.length) {
      return []
    }
    const units = await Promise.all(
      unitsConfigsPaths.map((unitConfigPath) => Mono0Unit.create({ unitConfigPath, config })),
    )
    return units.sort((a, b) => a.name.localeCompare(b.name))
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
      await tsconfig.write()
    }
    let packageJsonsDepsChanged = false
    for (const unit of this.units) {
      await unit.writeTsconfig()
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
