import type { PackageJson as PackageJsonTypeFest } from "type-fest"
import z from "zod"
import type { File0, Fs0 } from "@/tools/fs0"
import type { Mono0Config } from "@/tools/mono0/config"
import type { Mono0Unit } from "@/tools/mono0/unit"

export class Mono0PackageJson {
  name: string
  fs0: Fs0
  file0: File0
  config: Mono0Config
  value: Mono0PackageJson.ValueDefinition

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

  async getValueWithDeps({ deps }: { deps: Mono0Unit[] }) {
    const currentValue = await this.getCurrentValue()
    currentValue.dependencies = Object.fromEntries(
      Object.entries(currentValue.dependencies || {}).filter(([key, value]) => value !== "workspace:*"),
    )
    const mergedValue = Mono0PackageJson.merge(currentValue, { name: this.name, ...this.value })
    if (deps.length) {
      if (!mergedValue.dependencies) {
        mergedValue.dependencies = {}
      }
      for (const unit of deps) {
        mergedValue.dependencies[unit.name] = "workspace:*"
      }
    }
    return mergedValue
  }

  async write({ deps }: { deps: Mono0Unit[] }) {
    const mergedValue = await this.getValueWithDeps({ deps })
    await this.file0.write(JSON.stringify(mergedValue, null, 2))
  }

  static zValueDefinition = z.looseObject({
    dependencies: z.record(z.string(), z.string()).optional(),
    devDependencies: z.record(z.string(), z.string()).optional(),
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
  ): Mono0PackageJson.Json {
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
