import nodePath from "node:path"
import type { File0, Fs0 } from "@ideanick/tools/fs0"
import type { Mono0CorePackage } from "@ideanick/tools/mono0/corePackage"
import type { Mono0ModulePackage } from "@ideanick/tools/mono0/modulePackage"
import { isEqual } from "lodash"

export class Mono0Tsconfig {
  file0: File0
  ownerCorePackageName: string | null
  guestCorePackageName: string | null
  modulePackageName: string | null

  private constructor(input: {
    file0: File0
    ownerCorePackageName: string | null
    guestCorePackageName: string | null
    modulePackageName: string | null
  }) {
    this.file0 = input.file0
    this.ownerCorePackageName = input.ownerCorePackageName
    this.guestCorePackageName = input.guestCorePackageName
    this.modulePackageName = input.modulePackageName
  }

  static create({
    packageDirFs0,
    ownerCorePackageName,
    guestCorePackageName,
    modulePackageName,
  }: {
    packageDirFs0: Fs0
    ownerCorePackageName: string | null
    guestCorePackageName: string | null
    modulePackageName: string | null
  }) {
    const file0 = packageDirFs0.createFile0(`tsconfig.${guestCorePackageName || ownerCorePackageName}.json`)
    return new Mono0Tsconfig({ file0, ownerCorePackageName, guestCorePackageName, modulePackageName })
  }

  getValue({
    corePackages,
    modulesPackages,
  }: {
    corePackages: Mono0CorePackage[]
    modulesPackages: Mono0ModulePackage[]
  }) {
    const ownerCorePackage = this.ownerCorePackageName
      ? corePackages.find((cp) => cp.name === this.ownerCorePackageName)
      : null
    const guestCorePackage = this.guestCorePackageName
      ? corePackages.find((cp) => cp.name === this.guestCorePackageName)
      : null
    const modulePackage = this.modulePackageName
      ? modulesPackages.find((mp) => mp.name === this.modulePackageName)
      : null

    if (ownerCorePackage && !guestCorePackage) {
      return {
        extends: ownerCorePackage.selfDirFs0.resolve("./tsconfig.base.json"),
        compilerOptions: {
          composite: true,
          rootDir: "../src",
          outDir: `../dist/${ownerCorePackage.name}`,
        },
        include: ["src"],
        references: [
          ...ownerCorePackage.externalTsconfigs.map((et) => {
            return {
              path: nodePath.relative(this.file0.path.dir, et.file0.path.abs),
            }
          }),
        ],
      }
    } else if (guestCorePackage && !modulePackage) {
      return {
        extends: guestCorePackage.selfDirFs0.resolve("./tsconfig.base.json"),
        compilerOptions: {
          composite: true,
          rootDir: "../src",
          outDir: `../dist/${guestCorePackage.name}`,
        },
        include: ["src"],
        references: [
          { path: nodePath.relative(this.file0.path.dir, guestCorePackage.localTsconfig.file0.path.abs) },
          ...guestCorePackage.externalTsconfigs
            .filter((et) => et.file0.path.abs !== this.file0.path.abs)
            .map((et) => {
              return {
                path: nodePath.relative(this.file0.path.dir, et.file0.path.abs),
              }
            }),
        ],
      }
    } else if (modulePackage && guestCorePackage) {
      return {
        extends: guestCorePackage.selfDirFs0.resolve("./tsconfig.base.json"),
        compilerOptions: {
          composite: true,
          rootDir: "../src",
          outDir: `../dist/${guestCorePackage.name}`,
        },
        include: ["src"],
        references: [
          { path: nodePath.relative(this.file0.path.dir, guestCorePackage.localTsconfig.file0.path.abs) },
          ...guestCorePackage.externalTsconfigs
            .filter((et) => et.file0.path.abs !== this.file0.path.abs)
            .map((et) => {
              return {
                path: nodePath.relative(this.file0.path.dir, et.file0.path.abs),
              }
            }),
        ],
      }
    } else {
      throw new Error(`Unknown state"`)
    }
  }

  async write({
    corePackages,
    modulesPackages,
  }: {
    corePackages: Mono0CorePackage[]
    modulesPackages: Mono0ModulePackage[]
  }) {
    const value = this.getValue({ corePackages, modulesPackages })
    const prevValue = await this.file0.importFresh()
    if (isEqual(prevValue, value)) {
      console.log(123)
      return
    }
    await this.file0.write(JSON.stringify(value, null, 2))
  }
}
