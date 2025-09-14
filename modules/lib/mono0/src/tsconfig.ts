import nodePath from "node:path"
import type { File0, Fs0 } from "@devp0nt/fs0"
import { uniqBy } from "lodash"
import type { TsConfigJson as TsConfigJsonTypeFest } from "type-fest"
import z from "zod"
import type { Mono0Config } from "./config"
import type { Mono0Unit } from "./unit"
import { omit, replacePlaceholdersDeep } from "./utils"

export class Mono0Tsconfig {
  fs0: Fs0
  file0: File0
  config: Mono0Config
  value: Mono0Tsconfig.ValueDefinition
  unit: Mono0Unit | undefined
  name: string
  generalTsconfigs: Mono0Tsconfig[]
  settings: Mono0Tsconfig.Settings

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
    settings: Mono0Tsconfig.Settings
    generalTsconfigs: Mono0Tsconfig[]
  }) {
    this.fs0 = fs0
    this.file0 = file0
    this.config = config
    this.value = value
    this.unit = unit
    this.name = name
    this.settings = settings
    this.generalTsconfigs = generalTsconfigs
  }

  static create({
    definition,
    config,
    fs0,
    unit,
    name,
    generalTsconfigs,
  }: {
    definition: Mono0Tsconfig.DefinitionParsed
    config: Mono0Config
    fs0: Fs0
    unit?: Mono0Unit
    name: string
    generalTsconfigs: Mono0Tsconfig[]
  }) {
    const file0 = definition.path ? fs0.createFile0(definition.path) : fs0.createFile0("tsconfig.json")
    const value = definition.value
    return new Mono0Tsconfig({ fs0, file0, config, value, unit, settings: definition.settings, name, generalTsconfigs })
  }

  static createGeneralsByConfig(config: Mono0Config) {
    const generalTsconfigs = Object.entries(config.tsconfigs).map(([key, value]) =>
      Mono0Tsconfig.create({ definition: value, config, fs0: config.configFs0, name: key, generalTsconfigs: [] }),
    )
    for (const generalTsconfig of generalTsconfigs) {
      generalTsconfig.generalTsconfigs = generalTsconfigs
    }
    return generalTsconfigs
  }

  static async parseValue({
    value,
    config,
    fs0,
    file0,
    settings,
    unit,
    units,
    generalTsconfigs,
  }: {
    value: Mono0Tsconfig.Json
    config: Mono0Config
    fs0: Fs0
    file0: File0
    settings: Mono0Tsconfig.Settings
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

    // if (unit) {
    //   const srcIncludeString = nodePath.join(fs0.toRel(unit.srcFs0.cwd, true), "**/*")
    //   if (!result.include?.includes(srcIncludeString)) {
    //     result.include = [srcIncludeString, ...(result.include || [])]
    //   }
    //   if (!result.compilerOptions?.rootDir) {
    //     result.compilerOptions = {
    //       ...result.compilerOptions,
    //       rootDir: fs0.toRel(unit.srcFs0.cwd, true),
    //     }
    //   }
    // }

    if (unit && settings.setSrcAsRootDir) {
      const srcRootDir = fs0.toRel(unit.srcFs0.cwd, true)
      result.compilerOptions = {
        ...result.compilerOptions,
        rootDir: srcRootDir,
      }
    }

    if (unit && settings.addSrcToInclude) {
      const srcRootDir = fs0.toRel(unit.srcFs0.cwd, true)
      const srcIncludeString = nodePath.join(srcRootDir, "**/*")
      result.include = [srcIncludeString, ...(result.include || [])]
    }

    if (unit && settings.clearPaths) {
      result.compilerOptions = {
        ...result.compilerOptions,
        paths: {},
      }
    }

    if (unit && settings.addSelfSrcToPaths) {
      result.compilerOptions = {
        ...(result.compilerOptions || {}),
        paths: {
          ...(result.compilerOptions?.paths || {}),
          [`${unit.name}/*`]: [`${fs0.toRel(unit.srcFs0.cwd)}/*`],
        },
      }
    }

    if (settings.clearReferences) {
      result.references = []
    }

    if (unit && settings.addDepsAsReferences) {
      result.references = [
        ...(result.references || []),
        ...unit.deps.map((dep) => ({
          path: dep.unit.tsconfig.file0.relToDir(file0),
        })),
      ]
    }

    if (unit && settings.addDeepDepsAsReferences) {
      result.references = uniqBy(
        [
          ...(result.references || []),
          ...unit.deps.flatMap((dep) =>
            dep.unit.deps.map((d) => ({
              path: d.unit.tsconfig.file0.relToDir(file0),
            })),
          ),
        ],
        "path",
      )
    }

    if (settings.addUnitsSrcToPaths) {
      const addUnitsSrcToPaths = settings.addUnitsSrcToPaths
      const scope = addUnitsSrcToPaths.scope
      const unitsScoped = scope === "all" ? units : unit?.deps.map((dep) => dep.unit) || []
      const match = addUnitsSrcToPaths.match
      const { Mono0Unit: Mono0UnitClass } = await import("./unit")
      const unitsFiltered = Mono0UnitClass.filterUnits({ units: unitsScoped, match })
      result.compilerOptions = {
        ...(result.compilerOptions || {}),
        paths: {
          ...(result.compilerOptions?.paths || {}),
          ...Object.fromEntries(
            unitsFiltered.flatMap((d) => [
              [`${d.name}/*`, [`${fs0.toRel(d.srcFs0.cwd)}/*`]],
              ...(addUnitsSrcToPaths.index && d.indexFile0
                ? [[`${d.name}`, [`${fs0.toRel(d.indexFile0.path.abs)}`]]]
                : []),
            ]),
          ),
        },
      }
    }

    if (settings.addUnitsDistToPaths) {
      const addUnitsDistToPaths = settings.addUnitsDistToPaths
      const scope = addUnitsDistToPaths.scope
      const unitsScoped = scope === "all" ? units : unit?.deps.map((dep) => dep.unit) || []
      const match = addUnitsDistToPaths.match
      const { Mono0Unit: Mono0UnitClass } = await import("./unit")
      const unitsFiltered = Mono0UnitClass.filterUnits({ units: unitsScoped, match })
      result.compilerOptions = {
        ...(result.compilerOptions || {}),
        paths: {
          ...(result.compilerOptions?.paths || {}),
          ...Object.fromEntries(
            unitsFiltered.flatMap((d) => [
              [`${d.name}/*`, [`${fs0.toRel(d.distFs0.cwd)}/*`]],
              ...(addUnitsDistToPaths.index && d.indexFile0
                ? [[`${d.name}`, [fs0.replaceExt(`${fs0.toRel(d.indexFile0.path.abs)}`, "js")]]]
                : []),
            ]),
          ),
        },
      }
    }

    replacePlaceholdersDeep(result, {
      name: unit?.name || "unknown",
      srcDir: fs0.toRel(unit?.srcFs0.cwd || ""),
      distDir: fs0.toRel(unit?.distFs0.cwd || ""),
    })

    return result
  }
  async parseValue({ units }: { units: Mono0Unit[] }) {
    return await Mono0Tsconfig.parseValue({
      value: this.value,
      config: this.config,
      fs0: this.fs0,
      file0: this.file0,
      settings: this.settings,
      unit: this.unit,
      units,
      generalTsconfigs: this.generalTsconfigs,
    })
  }

  async write({ units }: { units: Mono0Unit[] }) {
    const valueParsed = await Mono0Tsconfig.parseValue({
      value: this.value,
      config: this.config,
      fs0: this.fs0,
      file0: this.file0,
      settings: this.settings,
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
      setSrcAsRootDir: z.boolean().optional(),
      addSrcToInclude: z.boolean().optional(),
      clearPaths: z.boolean().optional(),
      addSelfSrcToPaths: z.boolean().optional(),
      addUnitsSrcToPaths: z
        .union([
          z.boolean(),
          z.string(),
          z.object({
            scope: z
              .enum(["all", "deps"])
              .optional()
              .default("all" as const),
            match: z.string().optional(),
            index: z.boolean().optional().default(true),
          }),
        ])
        .optional(),
      addUnitsDistToPaths: z
        .union([
          z.boolean(),
          z.string(),
          z.object({
            scope: z
              .enum(["all", "deps"])
              .optional()
              .default("all" as const),
            match: z.string().optional(),
            index: z.boolean().optional().default(true),
          }),
        ])
        .optional(),
      clearReferences: z.boolean().optional(),
      addDepsAsReferences: z.boolean().optional(),
      addDeepDepsAsReferences: z.boolean().optional(),
    })
    .optional()
    .default({})
    .transform((val) => {
      return {
        ...omit(val, ["addUnitsSrcToPaths", "addUnitsDistToPaths"]),
        addUnitsSrcToPaths:
          val.addUnitsSrcToPaths === false
            ? (false as const)
            : val.addUnitsSrcToPaths === true
              ? { scope: "all" as const, match: undefined, index: true }
              : typeof val.addUnitsSrcToPaths === "string"
                ? { scope: "all" as const, match: val.addUnitsSrcToPaths, index: true }
                : val.addUnitsSrcToPaths,
        addUnitsDistToPaths:
          val.addUnitsDistToPaths === false
            ? (false as const)
            : val.addUnitsDistToPaths === true
              ? { scope: "all" as const, match: undefined, index: true }
              : typeof val.addUnitsDistToPaths === "string"
                ? { scope: "all" as const, match: val.addUnitsDistToPaths, index: true }
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
          ? { path: val.path || "tsconfig.json", value: val.value, settings: val.settings || {} }
          : { path: "tsconfig.json", value: val, settings: {} }) as Mono0Tsconfig.FullDefinitionParsed,
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

  async getMeta({ units }: { units: Mono0Unit[] }) {
    return {
      path: this.file0.path.rel,
      value: await this.parseValue({ units }),
    }
  }
}

export namespace Mono0Tsconfig {
  export type Json = Omit<TsConfigJsonTypeFest, "extends"> & { extends?: string }
  // export type ValueDefinition = z.output<typeof Mono0Tsconfig.zValueDefinition>
  export type ValueDefinition = Json
  export type DefinitionSettings = Partial<z.input<typeof Mono0Tsconfig.zDefinitionSettings>>
  export type Settings = z.output<typeof Mono0Tsconfig.zDefinitionSettings>
  export type FullDefinition = {
    path: string
    value: Mono0Tsconfig.ValueDefinition
    settings: Mono0Tsconfig.DefinitionSettings
  }
  export type FullDefinitionParsed = z.output<typeof Mono0Tsconfig.zFullDefinition>
  export type Definition = ValueDefinition | Partial<FullDefinition>
  export type DefinitionParsed = z.output<typeof Mono0Tsconfig.zDefinition>
}
