import type { File0, Fs0 } from "@devp0nt/fs0"
import { isEqual } from "lodash"
import type { PackageJson as PackageJsonTypeFest } from "type-fest"
import z from "zod"
import type { Mono0Config } from "./config"
import { Mono0Logger } from "./logger"
import type { Mono0Unit } from "./unit"

export class Mono0PackageJson {
  name: string
  fs0: Fs0
  file0: File0
  config: Mono0Config
  value: Mono0PackageJson.ValueDefinition
  logger: Mono0Logger = Mono0Logger.create("packageJson")
  unit?: Mono0Unit

  private constructor({
    name,
    fs0,
    file0,
    config,
    value,
    unit,
  }: {
    name: string
    fs0: Fs0
    file0: File0
    config: Mono0Config
    value: Mono0PackageJson.ValueDefinition
    unit?: Mono0Unit
  }) {
    this.name = name
    this.fs0 = fs0
    this.file0 = file0
    this.config = config
    this.value = value
    this.unit = unit
  }

  static create({
    name,
    definition,
    config,
    fs0,
    unit,
  }: {
    name: string
    definition: Mono0PackageJson.DefinitionParsed
    config: Mono0Config
    fs0: Fs0
    unit?: Mono0Unit
  }) {
    const file0 = definition.path ? fs0.createFile0(definition.path) : fs0.createFile0("package.json")
    const value = definition.value
    return new Mono0PackageJson({ name, fs0, file0, config, value, unit })
  }

  async getCurrentValue() {
    if (!(await this.file0.isExists())) {
      return {} as Mono0PackageJson.Json
    }
    return await this.file0.readJson<Mono0PackageJson.Json>()
  }

  async getNewValue() {
    const currentValue = await this.getCurrentValue()
    const prevWorkspaceDeps = Object.fromEntries(
      Object.entries(currentValue.dependencies || {}).filter(([key, value]) => value === "workspace:*"),
    )
    const newWorkspaceDeps: Record<string, string> = {}

    // delete previous workspace deps
    currentValue.dependencies = Object.fromEntries(
      Object.entries(currentValue.dependencies || {}).filter(([key, value]) => value !== "workspace:*"),
    )

    const mergedValue = Mono0PackageJson.merge(currentValue, { name: this.name || currentValue.name, ...this.value })
    const unit = this.unit
    if (unit?.deps.length) {
      if (!mergedValue.dependencies) {
        mergedValue.dependencies = {}
      }
      for (const dep of unit.deps) {
        mergedValue.dependencies[dep.unit.name] = "workspace:*"
        newWorkspaceDeps[dep.unit.name] = "workspace:*"
      }
    }
    const depsChanged = !isEqual(prevWorkspaceDeps, newWorkspaceDeps)

    if (unit?.settings.addExportsToPackageJsonFromDistDir) {
      const dirsPaths = unit.dirsPaths.map((dirPath) => ({
        relToPkg: this.file0.fs0.toRel(unit.getPathInDistByPathInSrc(dirPath), true),
        relToDist: unit.distFs0.toRel(unit.getPathInDistByPathInSrc(dirPath), true),
      }))
      const distPath = this.file0.fs0.toRel(unit.distFs0.cwd, true)
      const fixSlahes = (path: string) => path.replace(/\/+/g, "/")
      const exports = {
        ...(unit.indexFile0
          ? {
              ".": {
                import: fixSlahes(`${distPath}/${unit.indexFile0.path.basename}.js`),
                types: fixSlahes(`${distPath}/${unit.indexFile0.path.basename}.d.ts`),
              },
            }
          : {}),
        ...Object.fromEntries(
          dirsPaths.map((dirPath) => [
            fixSlahes(`${dirPath.relToDist}/*`),
            {
              import: fixSlahes(`${dirPath.relToPkg}/*.js`),
              types: fixSlahes(`${dirPath.relToPkg}/*.d.ts`),
            },
          ]),
        ),
      }
      mergedValue.exports = exports
    }

    if (unit?.settings.addExportsToPackageJsonFromSrcDir) {
      const dirsPaths = unit.dirsPaths.map((dirPath) => ({
        relToPkg: this.file0.fs0.toRel(dirPath, true),
        relToSrc: unit.srcFs0.toRel(dirPath, true),
      }))
      const srcPath = this.file0.fs0.toRel(unit.srcFs0.cwd, true)
      const fixSlahes = (path: string) => path.replace(/\/+/g, "/")
      const exts = unit.settings.addExportsToPackageJsonFromSrcDirExts?.length
        ? unit.settings.addExportsToPackageJsonFromSrcDirExts.map((ext) => ext.replace(/^\./, ""))
        : undefined
      const exports = {
        ...(unit.indexFile0
          ? {
              ".": {
                import: fixSlahes(`${srcPath}/${unit.indexFile0.path.name}`),
                types: fixSlahes(`${srcPath}/${unit.indexFile0.path.name}`),
              },
            }
          : {}),
        ...Object.fromEntries(
          dirsPaths.map((dirPath) => [
            fixSlahes(`${dirPath.relToSrc}/*`),
            {
              import: !exts
                ? fixSlahes(`${dirPath.relToPkg}/*`)
                : exts.map((ext) => fixSlahes(`${dirPath.relToPkg}/*.${ext}`)),
              types: !exts
                ? fixSlahes(`${dirPath.relToPkg}/*`)
                : exts.map((ext) => fixSlahes(`${dirPath.relToPkg}/*.${ext}`)),
            },
          ]),
        ),
      }

      mergedValue.exports = exports
    }

    if (unit?.settings.removeExportsFromPackageJson) {
      mergedValue.exports = {}
    }

    return { value: mergedValue, depsChanged }
  }

  async write() {
    const { value, depsChanged } = await this.getNewValue()
    await this.file0.write(JSON.stringify(value, null, 2), true)
    return { depsChanged }
  }

  static async writeRootPackageJson({ config, units }: { config: Mono0Config; units: Mono0Unit[] }) {
    const file0 = config.rootFs0.createFile0("package.json")
    const prevValue = await file0.readJson<Mono0PackageJson.Json>()
    const worksapcesPackages = units.map((unit) => file0.fs0.toRel(unit.packageJson.file0.path.dir))
    const newValue = {
      ...prevValue,
      workspaces: {
        ...(prevValue.workspaces || {}),
        packages: worksapcesPackages,
      },
    }
    await file0.write(JSON.stringify(newValue, null, 2), true)
  }

  static zValueDefinition = z.looseObject({
    dependencies: z.record(z.string(), z.string().optional()).optional(),
    devDependencies: z.record(z.string(), z.string().optional()).optional(),
    exports: z
      .record(
        z.string(),
        z.record(z.string(), z.union([z.string(), z.record(z.string(), z.string()), z.array(z.string())])).optional(),
      )
      .optional(),
  })

  static zFullDefinition = z.object({
    path: z.string().optional(),
    value: Mono0PackageJson.zValueDefinition.optional().default({}),
  })

  static zDefinition = z
    .union([Mono0PackageJson.zValueDefinition, Mono0PackageJson.zFullDefinition])
    .transform(
      (val) =>
        ("path" in val || "value" in val
          ? { path: val.path, value: val.value }
          : { path: undefined, value: val }) as Mono0PackageJson.FullDefinition,
    )

  static merge(
    ...packageJsonsValues: [
      Mono0PackageJson.Json | Mono0PackageJson.ValueDefinition,
      ...(Mono0PackageJson.Json | Mono0PackageJson.ValueDefinition)[],
    ]
  ): Mono0PackageJson.ValueDefinition {
    return packageJsonsValues.reduce((acc, packageJsonValue) => {
      return {
        // biome-ignore lint/performance/noAccumulatingSpread: <oh...>
        ...acc,
        ...packageJsonValue,
        ...(acc.dependencies || packageJsonValue.dependencies
          ? { dependencies: { ...acc.dependencies, ...packageJsonValue.dependencies } }
          : {}),
        ...(acc.devDependencies || packageJsonValue.devDependencies
          ? { devDependencies: { ...acc.devDependencies, ...packageJsonValue.devDependencies } }
          : {}),
      }
    }, {} as any)
  }

  async getMeta() {
    return {
      path: this.file0.path.rel,
      value: (await this.getNewValue()).value,
    }
  }
}

export namespace Mono0PackageJson {
  export type Json = PackageJsonTypeFest
  export type ValueDefinition = z.output<typeof Mono0PackageJson.zValueDefinition>
  // export type ValueDefinition = Json
  export type FullDefinition = {
    path?: string
    value: Mono0PackageJson.ValueDefinition
  }
  export type Definition = ValueDefinition | FullDefinition
  export type DefinitionParsed = z.output<typeof Mono0PackageJson.zDefinition>
}
