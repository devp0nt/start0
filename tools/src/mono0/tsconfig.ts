import nodePath from "node:path"
import type { TsConfigJson as TsConfigJsonTypeFest } from "type-fest"
import z from "zod"
import type { File0, Fs0 } from "@/tools/fs0"
import type { Mono0Config } from "@/tools/mono0/config"
import type { Mono0Unit } from "@/tools/mono0/unit"

export class Mono0Tsconfig {
  fs0: Fs0
  file0: File0
  config: Mono0Config
  value: Mono0Tsconfig.ValueDefinition
  unit: Mono0Unit | undefined

  private constructor({
    fs0,
    file0,
    config,
    value,
    unit,
  }: { fs0: Fs0; file0: File0; config: Mono0Config; value: Mono0Tsconfig.ValueDefinition; unit?: Mono0Unit }) {
    this.fs0 = fs0
    this.file0 = file0
    this.config = config
    this.value = value
    this.unit = unit
  }

  static create({
    definition,
    config,
    fs0,
    unit,
  }: {
    definition: Mono0Tsconfig.DefinitionParsed
    config: Mono0Config
    fs0: Fs0
    unit?: Mono0Unit
  }) {
    const file0 = definition.path ? fs0.createFile0(definition.path) : fs0.createFile0("tsconfig.json")
    const value = definition.value
    return new Mono0Tsconfig({ fs0, file0, config, value, unit })
  }

  static parseValue({
    value,
    config,
    fs0,
    file0,
    unit,
  }: {
    value: Mono0Tsconfig.Json
    config: Mono0Config
    fs0: Fs0
    file0: File0
    unit?: Mono0Unit
  }) {
    const result = value
    if (result.extends) {
      if (result.extends.startsWith("$")) {
        const tsconfigName = result.extends.slice(1)
        const extendsTsconfig = config.tsconfigs[tsconfigName]
        if (!extendsTsconfig) {
          throw new Error(`Tsconfig "${tsconfigName}" not found in "${file0.path.rel}"`)
        }
        result.extends = extendsTsconfig.file0.relToDir(file0)
      }
    }
    if (result.exclude) {
      const parsedExclude = []
      for (const exclude of result.exclude) {
        if (exclude.startsWith("$")) {
          const fileSelectorName = exclude.slice(1)
          const fileSelector = config.filesSelectors[fileSelectorName]
          if (!fileSelector) {
            throw new Error(`File selector "${fileSelectorName}" not found in "${file0.path.rel}"`)
          }
          parsedExclude.push(...fileSelector)
        } else {
          parsedExclude.push(exclude)
        }
      }
      result.exclude = parsedExclude
    }
    if (result.include) {
      const parsedInclude = []
      for (const include of result.include) {
        if (include.startsWith("$")) {
          const fileSelectorName = include.slice(1)
          const fileSelector = config.filesSelectors[fileSelectorName]
          if (!fileSelector) {
            throw new Error(`File selector "${fileSelectorName}" not found in "${file0.path.rel}"`)
          }
          parsedInclude.push(...fileSelector)
        } else {
          parsedInclude.push(include)
        }
      }
      result.include = parsedInclude
    }
    if (unit) {
      const srcIncludeString = nodePath.join(fs0.toRel(unit.srcFs0.cwd), "**/*")
      if (!result.include?.includes(srcIncludeString)) {
        result.include = [srcIncludeString, ...(result.include || [])]
      }
      if (!result.compilerOptions?.rootDir) {
        result.compilerOptions = {
          ...result.compilerOptions,
          rootDir: fs0.toRel(unit.srcFs0.cwd),
        }
      }
    }
    const references = []
    if (unit) {
      for (const dep of unit.deps) {
        references.push({
          path: dep.unit.tsconfig.file0.relToDir(file0),
        })
      }
    }
    result.references = references
    // TODO:ASAP use deepmap here
    if (result?.compilerOptions?.tsBuildInfoFile) {
      result.compilerOptions.tsBuildInfoFile = file0.fs0.toRel(
        file0.fs0.resolve(result.compilerOptions.tsBuildInfoFile.replace("{{name}}", unit?.name || "unknown")),
      )
    }
    return result
  }

  async write() {
    const valueParsed = Mono0Tsconfig.parseValue({
      value: this.value,
      config: this.config,
      fs0: this.fs0,
      file0: this.file0,
      unit: this.unit,
    })
    await this.file0.write(JSON.stringify(valueParsed, null, 2), true)
  }

  static async writeRootTsconfig({
    tsconfig,
    config,
    units,
  }: {
    tsconfig?: Mono0Tsconfig
    config: Mono0Config
    units: Mono0Unit[]
  }) {
    tsconfig =
      tsconfig ||
      Mono0Tsconfig.create({
        definition: { path: config.rootFs0.createFile0("tsconfig.json").path.rel, value: {} },
        config,
        fs0: config.rootFs0,
        unit: undefined,
      })
    const valueParsed = Mono0Tsconfig.parseValue({
      value: tsconfig.value,
      config: config,
      fs0: tsconfig.fs0,
      file0: tsconfig.file0,
      unit: tsconfig.unit,
    })
    const references = units.map((unit) => ({
      path: unit.tsconfig.file0.relToDir(tsconfig.file0),
    }))
    valueParsed.references = references
    valueParsed.files = []
    await tsconfig.file0.write(JSON.stringify(valueParsed, null, 2), true)
  }

  static async writeBaseTsconfig({
    tsconfig,
    config,
    units,
  }: {
    tsconfig?: Mono0Tsconfig
    config: Mono0Config
    units: Mono0Unit[]
  }) {
    tsconfig =
      tsconfig ||
      Mono0Tsconfig.create({
        definition: { path: config.rootFs0.createFile0("tsconfig.base.json").path.rel, value: {} },
        config,
        fs0: config.rootFs0,
        unit: undefined,
      })
    const valueParsed = Mono0Tsconfig.parseValue({
      value: tsconfig.value,
      config: config,
      fs0: tsconfig.fs0,
      file0: tsconfig.file0,
      unit: tsconfig.unit,
    })
    // const paths = Object.fromEntries(
    //   units.map((unit) => [`${unit.name}/*`, [`${tsconfig.file0.fs0.toRel(unit.srcFs0.cwd)}/*`]]),
    // )
    valueParsed.compilerOptions = {
      ...valueParsed.compilerOptions,
      // paths,
    }
    await tsconfig.file0.write(JSON.stringify(valueParsed, null, 2), true)
  }

  static zValueDefinition = z.looseObject({
    extends: z.string().optional(),
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
    compilerOptions: z
      .looseObject({
        baseUrl: z.string().optional(),
        rootDir: z.string().optional(),
        outDir: z.string().optional(),
        composite: z.boolean().optional(),
        declaration: z.boolean().optional(),
        declarationMap: z.boolean().optional(),
      })
      .optional(),
  })

  static zFullDefinition = z.object({
    path: z.string().optional(),
    value: Mono0Tsconfig.zValueDefinition.optional().default({}),
  })

  static zDefinition = z
    .union([Mono0Tsconfig.zValueDefinition, Mono0Tsconfig.zFullDefinition])
    .transform(
      (val) =>
        ("path" in val || "value" in val
          ? { path: val.path, value: val.value }
          : { path: undefined, value: val }) as Mono0Tsconfig.FullDefinition,
    )

  static merge(...tsconfigs: [Mono0Tsconfig.Json, ...Mono0Tsconfig.Json[]]): Mono0Tsconfig.Json {
    return tsconfigs.reduce((acc, tsconfig) => {
      return {
        // biome-ignore lint/performance/noAccumulatingSpread: <oh...>
        ...acc,
        ...tsconfig,
        ...(acc.compilerOptions || tsconfig.compilerOptions
          ? { compilerOptions: { ...acc.compilerOptions, ...tsconfig.compilerOptions } }
          : {}),
      }
    }, {} as Mono0Tsconfig.Json)
  }

  getMeta() {
    return {
      path: this.file0.path.rel,
      value: this.value,
    }
  }
}

export namespace Mono0Tsconfig {
  export type Json = Omit<TsConfigJsonTypeFest, "extends"> & { extends?: string }
  // export type ValueDefinition = z.output<typeof Mono0Tsconfig.zValueDefinition>
  export type ValueDefinition = Json
  export type FullDefinition = {
    path?: string
    value: Mono0Tsconfig.ValueDefinition
  }
  export type Definition = ValueDefinition | FullDefinition
  export type DefinitionParsed = z.output<typeof Mono0Tsconfig.zDefinition>
}
