import nodePath from "node:path"
import type { File0, Fs0 } from "@ideanick/tools/fs0"
import type { Mono0CorePackage } from "@ideanick/tools/mono0/corePackage"

export class Mono0CoreTsconfig {
  file0: File0
  ownerCorePackageName: string
  guestCorePackageName: string | null

  private constructor(input: {
    file0: File0
    ownerCorePackageName: string
    guestCorePackageName: string | null
  }) {
    this.file0 = input.file0
    this.ownerCorePackageName = input.ownerCorePackageName
    this.guestCorePackageName = input.guestCorePackageName
  }

  static create({
    ownerCorePackageName,
    packageDirFs0,
    guestCorePackageName,
  }: {
    ownerCorePackageName: string
    packageDirFs0: Fs0
    guestCorePackageName: string | null
  }) {
    const file0 = packageDirFs0.createFile0(`tsconfig.${guestCorePackageName || ownerCorePackageName}.json`)
    return new Mono0CoreTsconfig({ file0, ownerCorePackageName, guestCorePackageName })
  }

  getValue({ corePackages }: { corePackages: Mono0CorePackage[] }) {
    const ownerCorePackage = corePackages.find((cp) => cp.name === this.ownerCorePackageName)
    if (!ownerCorePackage) {
      throw new Error(`Owner core package "${this.ownerCorePackageName}" not found`)
    }
    const guestCorePackage = this.guestCorePackageName
      ? corePackages.find((cp) => cp.name === this.guestCorePackageName)
      : null
    if (this.guestCorePackageName && !guestCorePackage) {
      throw new Error(`Guest core package "${this.guestCorePackageName}" not found`)
    }
    if (!guestCorePackage) {
      return {
        extends: "../tsconfig.base.json",
        compilerOptions: {
          composite: true,
          rootDir: "../src",
          outDir: `../dist/${ownerCorePackage.name}`,
        },
        include: ["src"],
        references: ownerCorePackage.externalTsconfigs.map((et) => {
          return {
            path: nodePath.relative(this.file0.path.dir, et.file0.path.abs),
          }
        }),
      }
    } else {
      return {
        extends: "../tsconfig.base.json",
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
    }
  }

  async write({ corePackages }: { corePackages: Mono0CorePackage[] }) {
    const value = this.getValue({ corePackages })
    await this.file0.write(JSON.stringify(value, null, 2))
  }
}
