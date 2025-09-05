import { Mono0Config } from "@ideanick/tools/mono0/config"
import { Mono0CorePackage } from "@ideanick/tools/mono0/corePackage"

export class Mono0 {
  static mono0: Mono0

  config: Mono0Config
  corePackages: Mono0CorePackage[]

  private constructor(input: {
    config: Mono0Config
    corePackages: Mono0CorePackage[]
  }) {
    this.config = input.config
    this.corePackages = input.corePackages
    Mono0.mono0 = this
  }

  static async init() {
    const config = await Mono0Config.get()
    const corePackages: Mono0CorePackage[] = []
    for (const corePackageDefinition of config.corePackagesDefinitions) {
      const corePackage = Mono0CorePackage.create({ config, definition: corePackageDefinition })
      corePackages.push(corePackage)
    }
    for (const corePackage of corePackages) {
      corePackage.createAllExternalTsconfigs({ corePackages })
    }
    return new Mono0({ config, corePackages })
  }

  static async write() {
    const mono0 = Mono0.mono0 || (await Mono0.init())
    for (const corePackage of mono0.corePackages) {
      await corePackage.localTsconfig.write({ corePackages: mono0.corePackages })
      for (const externalTsconfig of corePackage.externalTsconfigs) {
        await externalTsconfig.write({ corePackages: mono0.corePackages })
      }
    }
  }
}
