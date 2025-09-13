import type { Fs0 } from "@/tools/fs0"
import { Gen0 } from "@/tools/gen0"
import { Mono0Config } from "@/tools/mono0/config"
import { Mono0Logger } from "@/tools/mono0/logger"
import { Mono0Tsconfig } from "@/tools/mono0/tsconfig"
import { Mono0Unit } from "@/tools/mono0/unit"
import watcherGen0 from "@/tools/mono0/watcher-gen0"

// TODO: bun install on package.json change
// TODO: workspaces in package.json

// TODO: modules/{trpc,idea,...}/{backend,site,shared}
// TODO: мэниконфиг
// TODO: other модуль для ленивых
// TODO: валдатор циклических зависимостей
// TODO: fs0 withTsconfigPath → gen0 importFromFiles
// TODO: mono0 генератор jest file

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
    for (const [tsconfigName, tsconfig] of Object.entries(this.config.tsconfigs)) {
      if (tsconfigName === "root") {
        await Mono0Tsconfig.writeRootTsconfig({ tsconfig, config: this.config, units: this.units })
      } else {
        await tsconfig.write()
      }
    }
    for (const unit of this.units) {
      await unit.writeTsconfig()
      await unit.writePackageJson()
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
