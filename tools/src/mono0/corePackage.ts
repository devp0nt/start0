import type { Fs0 } from "@/tools/fs0"
import type { Mono0Config } from "@/tools/mono0/config"
import { Mono0CoreBaseTsconfig, type Mono0RootBaseTsconfig, Mono0Tsconfig } from "@/tools/mono0/tsconfig"

export class Mono0CorePackage {
  name: string
  alias: string
  selfDirFs0: Fs0
  packageDirFs0: Fs0
  baseTsconfig: Mono0Tsconfig
  coreBaseTsconfig: Mono0CoreBaseTsconfig
  tsconfigs: Mono0Tsconfig[]

  private constructor(input: {
    name: string
    alias: string
    selfDirFs0: Fs0
    baseTsconfig: Mono0Tsconfig
    coreBaseTsconfig: Mono0CoreBaseTsconfig
    tsconfigs: Mono0Tsconfig[]
    packageDirFs0: Fs0
  }) {
    this.name = input.name
    this.alias = input.alias
    this.selfDirFs0 = input.selfDirFs0
    this.packageDirFs0 = input.packageDirFs0
    this.baseTsconfig = input.baseTsconfig
    this.coreBaseTsconfig = input.coreBaseTsconfig
    this.tsconfigs = input.tsconfigs
  }

  static create({
    config,
    definition,
    rootBaseTsconfig,
  }: {
    config: Mono0Config
    definition: Mono0Config.CorePackageDefinition
    rootBaseTsconfig: Mono0RootBaseTsconfig
  }) {
    const selfDirFs0 = config.fs0.create({ cwd: definition.path })
    const packageDirFs0 = selfDirFs0.create({ cwd: "./package" })
    const coreBaseTsconfig = Mono0CoreBaseTsconfig.create({
      selfDirFs0,
      rootBaseTsconfig,
      corePackageName: definition.name,
    })
    const baseTsconfig = Mono0Tsconfig.create({
      corePackageName: definition.name,
      packageDirFs0,
    })
    const tsconfig = Mono0Tsconfig.create({
      corePackageName: definition.name,
      packageDirFs0,
    })
    return new Mono0CorePackage({
      name: definition.name,
      alias: definition.alias,
      selfDirFs0,
      packageDirFs0,
      tsconfigs: [tsconfig],
      baseTsconfig,
      coreBaseTsconfig,
    })
  }

  addTsconfig(tsconfig: Mono0Tsconfig) {
    this.tsconfigs.push(tsconfig)
  }

  addTsconfigsByCorePackages({ corePackages }: { corePackages: Mono0CorePackage[] }) {
    for (const corePackage of corePackages) {
      if (corePackage.name === this.name) {
        continue
      }
      this.addTsconfig(
        Mono0Tsconfig.create({
          corePackageName: this.name,
          packageDirFs0: corePackage.packageDirFs0,
        }),
      )
    }
  }
}
