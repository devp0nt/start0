import nodePath from "node:path"
import type { File0, Fs0 } from "@devp0nt/fs0"
import type { TsConfigJson as TsConfigJsonTypeFest } from "type-fest"
import z from "zod"
import type { Mono0Config } from "./config"
import type { Mono0Unit } from "./unit"

export class Mono0Tsconfig {
  fs0: Fs0
  file0: File0
  config: Mono0Config
  value: Mono0Tsconfig.ValueDefinition
  unit: Mono0Unit | undefined
  name: string
  generalTsconfigs: Mono0Tsconfig[]
  settings: Mono0Tsconfig.DefinitionSettings

  private constructor({
    fs0,
    file0,
    config,
    value,
    unit,
    name,
    settings,
    generalTsconfigs,
  }: {
    fs0: Fs0
    file0: File0
    config: Mono0Config
    value: Mono0Tsconfig.ValueDefinition
    unit?: Mono0Unit
    name: string
    settings?: Mono0Tsconfig.DefinitionSettings
    generalTsconfigs: Mono0Tsconfig[]
  }) {
    this.fs0 = fs0
    this.file0 = file0
    this.config = config
    this.value = value
    this.unit = unit
    this.name = name
    this.settings = Mono0Tsconfig.zDefinitionSettings.parse(settings)
    this.generalTsconfigs = generalTsconfigs
  }

  static create({
    definition,
    config,
    fs0,
    unit,
    settings,
    name,
    generalTsconfigs,
  }: {
    definition: Mono0Tsconfig.DefinitionParsed
    config: Mono0Config
    fs0: Fs0
    unit?: Mono0Unit
    settings?: Mono0Tsconfig.DefinitionSettings
    name: string
    generalTsconfigs: Mono0Tsconfig[]
  }) {
    const file0 = definition.path ? fs0.createFile0(definition.path) : fs0.createFile0("tsconfig.json")
    const value = definition.value
    return new Mono0Tsconfig({ fs0, file0, config, value, unit, settings, name, generalTsconfigs })
  }

  static createGeneralsByConfig(config: Mono0Config) {
    const generalTsconfigs = Object.entries(config.tsconfigs).map(([key, value]) =>
      Mono0Tsconfig.create({ definition: value, config, fs0: config.rootFs0, name: key, generalTsconfigs: [] }),
    )
    for (const generalTsconfig of generalTsconfigs) {
      generalTsconfig.generalTsconfigs = generalTsconfigs
    }
    return generalTsconfigs
  }

  static parseValue({
    value,
    config,
    fs0,
    file0,
    unit,
    units,
    generalTsconfigs,
  }: {
    value: Mono0Tsconfig.Json
    config: Mono0Config
    fs0: Fs0
    file0: File0
    unit?: Mono0Unit
    units: Mono0Unit[]
    generalTsconfigs: Mono0Tsconfig[]
  }) {
    const result = value
    if (result.extends) {
      if (result.extends.startsWith("$")) {
        const tsconfigName = result.extends.slice(1)
        const extendsTsconfig = generalTsconfigs.find((tsconfig) => tsconfig.name === tsconfigName)
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
      const srcIncludeString = nodePath.join(fs0.toRel(unit.srcFs0.cwd, true), "**/*")
      if (!result.include?.includes(srcIncludeString)) {
        result.include = [srcIncludeString, ...(result.include || [])]
      }
      if (!result.compilerOptions?.rootDir) {
        result.compilerOptions = {
          ...result.compilerOptions,
          rootDir: fs0.toRel(unit.srcFs0.cwd, true),
        }
      }
    }

    // TODO:ASAP add all references
    // const references = units.map((unit) => ({
    //   path: unit.tsconfig.file0.relToDir(tsconfig.file0),
    // }))

    const references = []
    if (unit?.settings.addReferencesToTsconfigOfDependentUnits) {
      for (const dep of unit.deps) {
        references.push({
          path: dep.unit.tsconfig.file0.relToDir(file0),
        })
      }
    }
    result.references = references
    if (unit?.settings.addSelfSrcPathToTsconfig) {
      result.compilerOptions = {
        ...(result.compilerOptions || {}),
        paths: {
          ...(result.compilerOptions?.paths || {}),
          [`${unit.name}/*`]: [`${fs0.toRel(unit.srcFs0.cwd)}/*`],
        },
      }
    }
    if (unit?.settings.addPathsToTsconfigOfDependentUnits) {
      result.compilerOptions = {
        ...(result.compilerOptions || {}),
        paths: {
          ...(result.compilerOptions?.paths || {}),
          ...Object.fromEntries(
            unit.deps.flatMap((d) => [
              [`${d.unit.name}/*`, [`${fs0.toRel(d.unit.srcFs0.cwd)}/*`]],
              ...(d.unit.indexFile0 ? [[`${d.unit.name}`, [`${fs0.toRel(d.unit.indexFile0.path.abs)}`]]] : []),
            ]),
          ),
        },
      }
    }
    if (unit?.settings.addPathsToTsconfigOfAllUnits) {
      result.compilerOptions = {
        ...(result.compilerOptions || {}),
        paths: {
          ...(result.compilerOptions?.paths || {}),
          ...Object.fromEntries(
            units.flatMap((d) => [
              [`${d.name}/*`, [`${fs0.toRel(d.srcFs0.cwd)}/*`]],
              ...(d.indexFile0 ? [[`${d.name}`, [`${fs0.toRel(d.indexFile0.path.abs)}`]]] : []),
            ]),
          ),
        },
      }
    }

    // TODO:ASAP use deepmap here, and use placheolders setting
    if (result?.compilerOptions?.tsBuildInfoFile && unit?.name) {
      result.compilerOptions.tsBuildInfoFile = file0.fs0.toRel(
        file0.fs0.resolve(result.compilerOptions.tsBuildInfoFile.replace("{{name}}", unit.name)),
      )
    }
    return result
  }
  parseValue({ units }: { units: Mono0Unit[] }) {
    return Mono0Tsconfig.parseValue({
      value: this.value,
      config: this.config,
      fs0: this.fs0,
      file0: this.file0,
      unit: this.unit,
      units,
      generalTsconfigs: this.generalTsconfigs,
    })
  }

  async write({ units }: { units: Mono0Unit[] }) {
    const valueParsed = Mono0Tsconfig.parseValue({
      value: this.value,
      config: this.config,
      fs0: this.fs0,
      file0: this.file0,
      unit: this.unit,
      units,
      generalTsconfigs: this.generalTsconfigs,
    })
    await this.file0.write(JSON.stringify(valueParsed, null, 2), true)
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

  static zDefinitionSettings = z
    .object({
      addSelfSrcToPaths: z.boolean().optional(),
      addUnitsSrcToPaths: z
        .union([
          z.boolean(),
          z.string(),
          z.object({
            scope: z.enum(["all", "deps"]).optional().default("all"),
            match: z.string().optional(),
          }),
        ])
        .optional(),
      addUnitsDistToPaths: z
        .union([
          z.boolean(),
          z.string(),
          z.object({
            scope: z.enum(["all", "deps"]).optional().default("all"),
            match: z.string().optional(),
          }),
        ])
        .optional(),
      addDepsAsReferences: z.boolean().optional(),
      addDeepDepsAsReferences: z.boolean().optional(),
    })
    .optional()
    .default({})
    .transform((val) => {
      return {
        ...val,
        addUnitsSrcToPaths:
          val.addUnitsSrcToPaths === false
            ? false
            : val.addUnitsSrcToPaths === true
              ? { scope: "all", match: undefined }
              : typeof val.addUnitsSrcToPaths === "string"
                ? { scope: "all", match: val.addUnitsSrcToPaths }
                : val.addUnitsSrcToPaths,
        addUnitsDistToPaths:
          val.addUnitsDistToPaths === false
            ? false
            : val.addUnitsDistToPaths === true
              ? { scope: "all", match: undefined }
              : typeof val.addUnitsDistToPaths === "string"
                ? { scope: "all", match: val.addUnitsDistToPaths }
                : val.addUnitsDistToPaths,
      }
    })

  static zFullDefinition = z.object({
    path: z.string().optional().default("tsconfig.json"),
    settings: Mono0Tsconfig.zDefinitionSettings,
    value: Mono0Tsconfig.zValueDefinition.optional().default({}),
  })

  static zDefinition = z
    .union([Mono0Tsconfig.zValueDefinition, Mono0Tsconfig.zFullDefinition])
    .transform(
      (val) =>
        ("path" in val || "value" in val
          ? { path: val.path, value: val.value }
          : { path: "tsconfig.json", value: val }) as Mono0Tsconfig.FullDefinition,
    )

  static definitionDefault = {
    path: "tsconfig.json",
    value: {},
    settings: {},
  } satisfies Mono0Tsconfig.FullDefinition

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

  getMeta({ units }: { units: Mono0Unit[] }) {
    return {
      path: this.file0.path.rel,
      value: this.parseValue({ units }),
    }
  }
}

export namespace Mono0Tsconfig {
  export type Json = Omit<TsConfigJsonTypeFest, "extends"> & { extends?: string }
  // export type ValueDefinition = z.output<typeof Mono0Tsconfig.zValueDefinition>
  export type ValueDefinition = Json
  export type DefinitionSettings = z.output<typeof Mono0Tsconfig.zDefinitionSettings>
  export type FullDefinition = {
    path: string
    value: Mono0Tsconfig.ValueDefinition
    settings: Partial<DefinitionSettings>
  }
  export type Definition = ValueDefinition | Partial<FullDefinition>
  export type DefinitionParsed = z.output<typeof Mono0Tsconfig.zDefinition>
}
