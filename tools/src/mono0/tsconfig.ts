import nodePath from "node:path"
import type { File0, Fs0 } from "@ideanick/tools/fs0"
import type { Mono0CorePackage } from "@ideanick/tools/mono0/corePackage"
import type { Mono0ModulePackage } from "@ideanick/tools/mono0/modulePackage"
import { isEqual, isMatch } from "lodash"

export class Mono0Tsconfig {
  file0: File0
  corePackageName: string
  rootBaseTsconfigPath: string
  type: "local" | "external" | "base"

  private constructor(input: {
    file0: File0
    corePackageName: string
    rootBaseTsconfigPath: string
    type: "local" | "external" | "base"
  }) {
    this.file0 = input.file0
    this.corePackageName = input.corePackageName
    this.rootBaseTsconfigPath = input.rootBaseTsconfigPath
    this.type = input.type
  }

  static create({
    packageDirFs0,
    corePackageName,
    rootBaseTsconfigPath,
    type,
  }: {
    packageDirFs0: Fs0
    corePackageName: string
    rootBaseTsconfigPath: string
    type: "local" | "external" | "base"
  }) {
    const file0 = packageDirFs0.createFile0(`tsconfig.${corePackageName}.json`)
    return new Mono0Tsconfig({ file0, corePackageName, rootBaseTsconfigPath, type })
  }

  getValue({
    corePackages,
    modulesPackages,
  }: {
    corePackages: Mono0CorePackage[]
    modulesPackages: Mono0ModulePackage[]
  }) {
    const corePackage = corePackages.find((cp) => cp.name === this.corePackageName)
    if (!corePackage) {
      throw new Error(`Core package "${this.corePackageName}" not found`)
    }

    if (this.type === "local") {
      return {
        extends: nodePath.relative(this.file0.path.dir, corePackage.baseTsconfig.file0.path.abs),
        compilerOptions: {
          composite: true,
          rootDir: "../src",
          outDir: `../dist/${corePackage.name}`,
        },
        include: ["src"],
        references: [
          ...corePackage.externalTsconfigs.map((et) => {
            return {
              path: nodePath.relative(this.file0.path.dir, et.file0.path.abs),
            }
          }),
        ],
      }
    } else if (this.type === "external") {
      return {
        extends: nodePath.relative(this.file0.path.dir, corePackage.baseTsconfig.file0.path.abs),
        compilerOptions: {
          composite: true,
          rootDir: "../src",
          outDir: `../dist/${corePackage.name}`,
        },
        include: ["src"],
        references: [
          { path: nodePath.relative(this.file0.path.dir, corePackage.localTsconfig.file0.path.abs) },
          ...corePackage.externalTsconfigs
            .filter((et) => et.file0.path.abs !== this.file0.path.abs)
            .map((et) => {
              return {
                path: nodePath.relative(this.file0.path.dir, et.file0.path.abs),
              }
            }),
        ],
      }
    } else if (this.type === "base") {
      return {
        extends: nodePath.relative(this.file0.path.dir, this.rootBaseTsconfigPath),
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
    const prevValue = JSON.parse(await this.file0.read())
    if (this.type === "base") {
      if (isMatch(value, prevValue)) {
        return
      }
      await this.file0.write(JSON.stringify({ ...prevValue, ...value }, null, 2))
    } else {
      if (isEqual(prevValue, value)) {
        return
      }
      await this.file0.write(JSON.stringify(value, null, 2))
    }
  }
}
