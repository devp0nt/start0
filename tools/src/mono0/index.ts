import type { Fs0 } from "@/tools/fs0"
import { Mono0Config } from "@/tools/mono0/config"
import { Mono0Unit } from "@/tools/mono0/unit"

// TODO: Тсконфиги, пакейджейсоны, рут  тс, рут пкг, бэйз тс, мэни конфиг
// TODO: Не доллар точка, а просто доллар
// TODO: Релейшен не соурс а инклюде
// TODO: Хот модуль это просто модуль у которого появился paths, но у всех он может быть, может и не нужно
// TODO: Мэниконфиг также работает на paths, но тут потребуется линтер, чтобы запретить брать откуда нельзя, или !!! paths сразу делать умным с учётом папки и суффикса
// TODO: mono0 если цикл, то paths прописываем на src
// TODO: mono0 стейбл-анстейбл
// TODO: mono0 .mono0/tsconfig.*.json
// TODO: modules/{trpc,idea,...}/{backend,site,shared}
// TODO: mono0 **/mono0.json
// TODO: mono0 референс генертор + пакейдж джейсон генератор
// TODO: mono0 генератор и апдейтер темплейтов по созданным папкам
// TODO: ? mono0 автоинстал исходя из импортов в коде
// TODO: fs0 withTsconfigPath → gen0 importFromFiles
// TODO: mono0 генератор пасов в главном тсконфиге
// TODO: mono0 валдатор циклических зависимостей
// TODO: mono0 **/mono0.many.json
// TODO: mono0 генератор jest file
// TODO: mono0 генератор biome restrict imports
// TODO: other модуль для ленивых
// TODO: Всё решат полномасштабные циркулярные нпм зависимости, в то время как референсы и пасы останутся для тех случаев, где нам нужны быстрые типы
// TODO: exprimental В моно зеро возможность каждому файлу быть модулем

export class Mono0 {
  rootFs0: Fs0
  config: Mono0Config
  units: Mono0Unit[]

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
    return units
  }
}
