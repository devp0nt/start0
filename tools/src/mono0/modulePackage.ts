import { Fs0 } from "@ideanick/tools/fs0"
import type { Mono0CorePackage } from "@ideanick/tools/mono0/corePackage"
import { Mono0Tsconfig } from "@ideanick/tools/mono0/tsconfig"

export class Mono0ModulePackage {
  name: string
  selfDirFs0: Fs0
  packageDirFs0: Fs0
  tsconfigs: Mono0Tsconfig[] = []

  private constructor(input: {
    name: string
    selfDirFs0: Fs0
    packageDirFs0: Fs0
    tsconfigs: Mono0Tsconfig[]
  }) {
    this.name = input.name
    this.selfDirFs0 = input.selfDirFs0
    this.packageDirFs0 = input.packageDirFs0
    this.tsconfigs = input.tsconfigs
  }

  static create({ modulePath, corePackages }: { modulePath: string; corePackages: Mono0CorePackage[] }) {
    const selfDirFs0 = Fs0.create({ cwd: modulePath })
    const name = selfDirFs0.basename(modulePath)
    const packageDirFs0 = selfDirFs0.create({ cwd: "./package" })
    const tsconfigs = corePackages.map((corePackage) => {
      const tsconfig = Mono0Tsconfig.create({
        packageDirFs0,
        corePackageName: corePackage.name,
        type: "external",
      })
      corePackage.addExternalTsconfig(tsconfig)
      return tsconfig
    })
    return new Mono0ModulePackage({
      name,
      selfDirFs0,
      packageDirFs0,
      tsconfigs,
    })
  }
}
