import { Mono0Config } from "@ideanick/tools/mono0/config"
import { Mono0CorePackage } from "@ideanick/tools/mono0/corePackage"
import { Mono0ModulePackage } from "@ideanick/tools/mono0/modulePackage"

// TODO: update base tsconfig to extend from root baseconfig
// TODO: filter by alias and name in files
// TODO: remove previous tsconfig.json

// TODO: package.json

export class Mono0 {
  static mono0: Mono0

  config: Mono0Config
  corePackages: Mono0CorePackage[]
  modulesPackages: Mono0ModulePackage[]
  rootBaseTsconfigPath: string

  private constructor(input: {
    config: Mono0Config
    corePackages: Mono0CorePackage[]
    modulesPackages: Mono0ModulePackage[]
    rootBaseTsconfigPath: string
  }) {
    this.config = input.config
    this.corePackages = input.corePackages
    this.modulesPackages = input.modulesPackages
    this.rootBaseTsconfigPath = input.rootBaseTsconfigPath
    Mono0.mono0 = this
  }

  static async init() {
    const config = await Mono0Config.get()
    const rootBaseTsconfigPath = config.fs0.resolve("./tsconfig.base.json")
    const corePackages: Mono0CorePackage[] = []
    for (const corePackageDefinition of config.corePackagesDefinitions) {
      const corePackage = Mono0CorePackage.create({ config, definition: corePackageDefinition, rootBaseTsconfigPath })
      corePackages.push(corePackage)
    }
    for (const corePackage of corePackages) {
      corePackage.createCoreExternalTsconfigs({ corePackages, rootBaseTsconfigPath })
    }

    const modulesPackages: Mono0ModulePackage[] = []
    const modulesPaths = await config.fs0.glob(config.modulesGlob, { onlyDirectories: true })
    for (const modulePath of modulesPaths) {
      const modulePackage = Mono0ModulePackage.create({
        modulePath,
        corePackages,
        rootBaseTsconfigPath,
      })
      modulesPackages.push(modulePackage)
    }
    return new Mono0({ config, corePackages, modulesPackages, rootBaseTsconfigPath })
  }

  static async write() {
    const mono0 = Mono0.mono0 || (await Mono0.init())
    for (const corePackage of mono0.corePackages) {
      await corePackage.localTsconfig.write({
        corePackages: mono0.corePackages,
        modulesPackages: mono0.modulesPackages,
      })
      for (const externalTsconfig of corePackage.externalTsconfigs) {
        await externalTsconfig.write({ corePackages: mono0.corePackages, modulesPackages: mono0.modulesPackages })
      }
    }
  }
}
