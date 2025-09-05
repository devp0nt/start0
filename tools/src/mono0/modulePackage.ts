import { Fs0 } from "@/tools/fs0"
import type { Mono0CorePackage } from "@/tools/mono0/corePackage"
import { Mono0Tsconfig } from "@/tools/mono0/tsconfig"

export class Mono0ModulePackage {
  name: string
  selfDirFs0: Fs0
  packageDirFs0: Fs0

  private constructor(input: {
    name: string
    selfDirFs0: Fs0
    packageDirFs0: Fs0
  }) {
    this.name = input.name
    this.selfDirFs0 = input.selfDirFs0
    this.packageDirFs0 = input.packageDirFs0
  }

  static create({ modulePath, corePackages }: { modulePath: string; corePackages: Mono0CorePackage[] }) {
    const selfDirFs0 = Fs0.create({ cwd: modulePath })
    const name = selfDirFs0.basename(modulePath)
    const packageDirFs0 = selfDirFs0.create({ cwd: "./package" })
    for (const corePackage of corePackages) {
      corePackage.addTsconfig(
        Mono0Tsconfig.create({
          packageDirFs0,
          corePackageName: corePackage.name,
        }),
      )
    }
    return new Mono0ModulePackage({
      name,
      selfDirFs0,
      packageDirFs0,
    })
  }
}
