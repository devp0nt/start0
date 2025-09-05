import type { Fs0 } from "@ideanick/tools/fs0"
import type { Mono0Config } from "@ideanick/tools/mono0/config"
import { Mono0Tsconfig } from "@ideanick/tools/mono0/tsconfig"

export class Mono0CorePackage {
  name: string
  alias: string
  selfDirFs0: Fs0
  packageDirFs0: Fs0
  baseTsconfig: Mono0Tsconfig
  tsconfigs: Mono0Tsconfig[]

  private constructor(input: {
    name: string
    alias: string
    selfDirFs0: Fs0
    baseTsconfig: Mono0Tsconfig
    tsconfigs: Mono0Tsconfig[]
    packageDirFs0: Fs0
  }) {
    this.name = input.name
    this.alias = input.alias
    this.selfDirFs0 = input.selfDirFs0
    this.packageDirFs0 = input.packageDirFs0
    this.baseTsconfig = input.baseTsconfig
    this.tsconfigs = input.tsconfigs
  }

  static create({
    config,
    definition,
    rootBaseTsconfigPath,
  }: {
    config: Mono0Config
    definition: Mono0Config.CorePackageDefinition
    rootBaseTsconfigPath: string
  }) {
    const selfDirFs0 = config.fs0.create({ cwd: definition.path })
    const packageDirFs0 = selfDirFs0.create({ cwd: "./package" })
    const baseTsconfig = Mono0Tsconfig.create({
      corePackageName: definition.name,
      packageDirFs0,
      rootBaseTsconfigPath,
      type: "base",
    })
    const tsconfig = Mono0Tsconfig.create({
      corePackageName: definition.name,
      packageDirFs0,
      rootBaseTsconfigPath,
      type: "general",
    })
    return new Mono0CorePackage({
      name: definition.name,
      alias: definition.alias,
      selfDirFs0,
      packageDirFs0,
      tsconfigs: [tsconfig],
      baseTsconfig,
    })
  }

  addTsconfig(tsconfig: Mono0Tsconfig) {
    this.tsconfigs.push(tsconfig)
  }

  addTsconfigsByCorePackages({
    corePackages,
    rootBaseTsconfigPath,
  }: {
    corePackages: Mono0CorePackage[]
    rootBaseTsconfigPath: string
  }) {
    for (const corePackage of corePackages) {
      if (corePackage.name === this.name) {
        continue
      }
      this.addTsconfig(
        Mono0Tsconfig.create({
          corePackageName: this.name,
          packageDirFs0: corePackage.packageDirFs0,
          rootBaseTsconfigPath,
          type: "general",
        }),
      )
    }
  }
}
