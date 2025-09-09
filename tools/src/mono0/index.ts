import type { Fs0 } from "@/tools/fs0"
import { Mono0Config } from "@/tools/mono0/config"
import { Mono0Unit } from "@/tools/mono0/unit"

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
