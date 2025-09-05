import nodePath from "node:path"
import { File0, type Fs0 } from "@ideanick/tools/fs0"
import type { Mono0CorePackage } from "@ideanick/tools/mono0/corePackage"
import type { Mono0ModulePackage } from "@ideanick/tools/mono0/modulePackage"
import { isEqual, isMatch } from "lodash"

export class Mono0Tsconfig {
  file0: File0
  corePackageName: string

  private constructor(input: {
    file0: File0
    corePackageName: string
  }) {
    this.file0 = input.file0
    this.corePackageName = input.corePackageName
  }

  static create({ packageDirFs0, corePackageName }: { packageDirFs0: Fs0; corePackageName: string }) {
    return new Mono0Tsconfig({
      file0: packageDirFs0.createFile0(`./tsconfig.${corePackageName}.json`),
      corePackageName,
    })
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
    const isSelfBaseTsconfig = corePackage.baseTsconfig.file0.path.abs === this.file0.path.abs

    return {
      extends: isSelfBaseTsconfig
        ? corePackage.coreBaseTsconfig.file0.relToDir(this.file0)
        : corePackage.baseTsconfig.file0.relToDir(this.file0),
      compilerOptions: {
        composite: true,
        rootDir: "../src",
        outDir: `../dist/${corePackage.name}`,
      },
      include: ["src"],
      references: [
        ...corePackage.tsconfigs
          .filter((t) => t.file0.path.abs !== this.file0.path.abs)
          .map((t) => {
            return {
              path: t.file0.relToDir(this.file0),
            }
          }),
      ],
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
    if (isEqual(prevValue, value)) {
      return
    }
    await this.file0.write(JSON.stringify(value, null, 2))
  }
}

export class Mono0RootTsconfig {
  file0: File0

  private constructor(input: {
    file0: File0
  }) {
    this.file0 = input.file0
  }

  static create({ filePath }: { filePath: string }) {
    return new Mono0RootTsconfig({
      file0: File0.create({ filePath }),
    })
  }

  getValue({
    corePackages,
    modulesPackages,
  }: {
    corePackages: Mono0CorePackage[]
    modulesPackages: Mono0ModulePackage[]
  }) {
    const references = []
    for (const corePackage of corePackages) {
      references.push({ path: corePackage.baseTsconfig.file0.relToDir(this.file0) })
    }
    return {
      files: [],
      references,
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
    if (isEqual(prevValue, value)) {
      return
    }
    await this.file0.write(
      JSON.stringify(
        {
          value,
        },
        null,
        2,
      ),
    )
  }
}

export class Mono0RootBaseTsconfig {
  file0: File0

  private constructor(input: {
    file0: File0
  }) {
    this.file0 = input.file0
  }

  static create({ filePath }: { filePath: string }) {
    return new Mono0RootBaseTsconfig({
      file0: File0.create({ filePath }),
    })
  }

  getPartialValue({
    corePackages,
    modulesPackages,
  }: {
    corePackages: Mono0CorePackage[]
    modulesPackages: Mono0ModulePackage[]
  }) {
    const paths: Record<string, string> = {}
    for (const corePackage of corePackages) {
      paths[`@/${corePackage.name}/*`] = this.file0.fs0.toRel(
        this.file0.fs0.resolve(corePackage.selfDirFs0.cwd, "src/*"),
      )
    }
    for (const modulePackage of modulesPackages) {
      paths[`@/${modulePackage.name}/*`] = this.file0.fs0.toRel(
        this.file0.fs0.resolve(modulePackage.selfDirFs0.cwd, "src/*"),
      )
    }
    return {
      compilerOptions: {
        paths,
      },
    }
  }

  async write({
    corePackages,
    modulesPackages,
  }: {
    corePackages: Mono0CorePackage[]
    modulesPackages: Mono0ModulePackage[]
  }) {
    const value = this.getPartialValue({ corePackages, modulesPackages })
    const prevValue = JSON.parse(await this.file0.read())
    if (isMatch(prevValue?.compilerOptions?.paths, value?.compilerOptions?.paths)) {
      return
    }
    const prevValueCustomPaths = Object.fromEntries(
      Object.entries(prevValue.compilerOptions?.paths || {}).filter(([key]) => !key.startsWith("@/")),
    )
    await this.file0.write(
      JSON.stringify(
        {
          ...prevValue,
          compilerOptions: {
            ...prevValue.compilerOptions,
            paths: {
              ...prevValueCustomPaths,
              ...value.compilerOptions.paths,
            },
          },
        },
        null,
        2,
      ),
    )
  }
}

export class Mono0CoreBaseTsconfig {
  file0: File0
  corePackageName: string
  rootBaseTsconfig: Mono0RootBaseTsconfig

  private constructor(input: {
    file0: File0
    corePackageName: string
    rootBaseTsconfig: Mono0RootBaseTsconfig
  }) {
    this.file0 = input.file0
    this.corePackageName = input.corePackageName
    this.rootBaseTsconfig = input.rootBaseTsconfig
  }

  static create({
    selfDirFs0,
    rootBaseTsconfig,
    corePackageName,
  }: {
    selfDirFs0: Fs0
    rootBaseTsconfig: Mono0RootBaseTsconfig
    corePackageName: string
  }) {
    return new Mono0CoreBaseTsconfig({
      file0: selfDirFs0.createFile0(`./tsconfig.base.json`),
      corePackageName,
      rootBaseTsconfig,
    })
  }

  getPartialValue() {
    return {
      extends: this.file0.fs0.toRel(this.rootBaseTsconfig.file0.path.abs),
    }
  }

  async write() {
    const value = this.getPartialValue()
    const prevValue = JSON.parse(await this.file0.read())
    if (isMatch(prevValue, value)) {
      return
    }
    await this.file0.write(JSON.stringify({ ...prevValue, ...value }, null, 2))
  }
}
