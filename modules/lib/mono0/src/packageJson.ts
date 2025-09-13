import type { File0, Fs0 } from "@devp0nt/fs0"
import type { Mono0Config } from "@devp0nt/mono0/config"
import { Mono0Logger } from "@devp0nt/mono0/logger"
import type { Mono0Unit } from "@devp0nt/mono0/unit"
import { execSync } from "child_process"
import { isEqual } from "lodash"
import type { PackageJson as PackageJsonTypeFest } from "type-fest"
import z from "zod"

export class Mono0PackageJson {
  name: string
  fs0: Fs0
  file0: File0
  config: Mono0Config
  value: Mono0PackageJson.ValueDefinition
  logger: Mono0Logger = Mono0Logger.create("packageJson")

  private constructor({
    name,
    fs0,
    file0,
    config,
    value,
  }: { name: string; fs0: Fs0; file0: File0; config: Mono0Config; value: Mono0PackageJson.ValueDefinition }) {
    this.name = name
    this.fs0 = fs0
    this.file0 = file0
    this.config = config
    this.value = value
  }

  static create({
    name,
    definition,
    config,
    fs0,
  }: {
    name: string
    definition: Mono0PackageJson.DefinitionParsed
    config: Mono0Config
    fs0: Fs0
  }) {
    const file0 = definition.path ? fs0.createFile0(definition.path) : fs0.createFile0("package.json")
    const value = definition.value
    return new Mono0PackageJson({ name, fs0, file0, config, value })
  }

  async getCurrentValue() {
    if (!(await this.file0.isExists())) {
      return {} as Mono0PackageJson.Json
    }
    return await this.file0.readJson<Mono0PackageJson.Json>()
  }

  async getNewValue({ deps }: { deps: Mono0Unit[] }) {
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
    if (deps.length) {
      if (!mergedValue.dependencies) {
        mergedValue.dependencies = {}
      }
      for (const unit of deps) {
        mergedValue.dependencies[unit.name] = "workspace:*"
        newWorkspaceDeps[unit.name] = "workspace:*"
      }
    }
    const depsChanged = !isEqual(prevWorkspaceDeps, newWorkspaceDeps)

    if (!this.value.exports) {
      const exports = {
        ".": {
          import: "./dist/index.js",
          types: "./dist/index.d.ts",
        },
        "./*": {
          import: "./dist/*.js",
          types: "./dist/*.d.ts",
        },
      }
      mergedValue.exports = exports
    }

    return { value: mergedValue, depsChanged }
  }

  async write({ deps }: { deps: Mono0Unit[] }) {
    const { value, depsChanged } = await this.getNewValue({ deps })
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
    exports: z.record(z.string(), z.record(z.string(), z.string()).optional()).optional(),
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

  getMeta() {
    return {
      path: this.file0.path.rel,
      value: this.value,
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
