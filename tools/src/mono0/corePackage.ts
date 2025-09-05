import type { Fs0 } from "@ideanick/tools/fs0"
import type { Mono0Config } from "@ideanick/tools/mono0/config"
import { Mono0CoreTsconfig } from "@ideanick/tools/mono0/coreTsconfig"

export class Mono0CorePackage {
  name: string
  alias: string
  selfDirFs0: Fs0
  packageDirFs0: Fs0
  localTsconfig: Mono0CoreTsconfig
  externalTsconfigs: Mono0CoreTsconfig[] = []

  private constructor(input: {
    name: string
    alias: string
    selfDirFs0: Fs0
    packageDirFs0: Fs0
    localTsconfig: Mono0CoreTsconfig
  }) {
    this.name = input.name
    this.alias = input.alias
    this.selfDirFs0 = input.selfDirFs0
    this.packageDirFs0 = input.packageDirFs0
    this.localTsconfig = input.localTsconfig
  }

  static create({ config, definition }: { config: Mono0Config; definition: Mono0Config.CorePackageDefinition }) {
    const selfDirFs0 = config.fs0.create({ cwd: definition.path })
    const packageDirFs0 = selfDirFs0.create({ cwd: "./package" })
    const localTsconfig = Mono0CoreTsconfig.create({
      ownerCorePackageName: definition.name,
      packageDirFs0,
      guestCorePackageName: null,
    })
    return new Mono0CorePackage({
      name: definition.name,
      alias: definition.alias,
      selfDirFs0,
      packageDirFs0,
      localTsconfig,
    })
  }

  addExternalTsconfig(externalTsconfig: Mono0CoreTsconfig) {
    this.externalTsconfigs.push(externalTsconfig)
  }

  createAllExternalTsconfigs({ corePackages }: { corePackages: Mono0CorePackage[] }) {
    for (const corePackage of corePackages) {
      if (corePackage.name === this.name) {
        continue
      }
      this.addExternalTsconfig(
        Mono0CoreTsconfig.create({
          ownerCorePackageName: corePackage.name,
          packageDirFs0: corePackage.packageDirFs0,
          guestCorePackageName: this.name,
        }),
      )
    }
  }
}
