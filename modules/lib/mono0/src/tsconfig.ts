import type { File0, Fs0 } from "@devp0nt/fs0"
import cloneDeep from "lodash-es/cloneDeep.js"
import uniq from "lodash-es/uniq.js"
import uniqBy from "lodash-es/uniqBy.js"
import type { TsConfigJson as TsConfigJsonTypeFest } from "type-fest"
import z from "zod"
import type { Mono0Config } from "./config"
import type { Mono0Unit } from "./unit"
import { fixSlahes, omit, replacePlaceholdersDeep } from "./utils"

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
    const result = cloneDeep(value)

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
      result.exclude = uniq(parsedExclude)
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
      result.include = uniq(parsedInclude)
    }

    if (unit && settings.setSrcAsRootDir && !result.compilerOptions?.rootDir) {
      const srcRootDir = fs0.toRel(unit.srcFs0.cwd, true)
      result.compilerOptions = {
        ...result.compilerOptions,
        rootDir: srcRootDir,
      }
    }

    if (unit && settings.addSrcToInclude) {
      const srcRootDir = fs0.toRel(unit.srcFs0.cwd, true)
      const srcIncludeString = fixSlahes(`${srcRootDir}/**/*`)
      result.include = [srcIncludeString, ...(result.include || [])]
    }

    if (unit && settings.clearPaths) {
      if (result.compilerOptions?.paths) {
        delete result.compilerOptions.paths
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
      if (result.references) {
        delete result.references
      }
    }

    if (settings.addUnitsAsReferences) {
      const addUnitsAsReferences = settings.addUnitsAsReferences
      const scope = addUnitsAsReferences.scope
      const unitsScoped = scope === "all" ? units : unit?.deps.map((dep) => dep.unit) || []
      const match = addUnitsAsReferences.match
      const tsconfigName = addUnitsAsReferences.tsconfig.startsWith("$")
        ? addUnitsAsReferences.tsconfig.slice(1)
        : addUnitsAsReferences.tsconfig
      const { Mono0Unit: Mono0UnitClass } = await import("./unit")
      const unitsFiltered = Mono0UnitClass.filterUnits({ units: unitsScoped, match })
      result.references = [
        ...(result.references || []),
        ...unitsFiltered.map((u) => {
          const tsconfig = u.tsconfigs.find((t) => t.name === tsconfigName)
          if (!tsconfig) {
            throw new Error(`Tsconfig "${tsconfigName}" not found in "${u.name}"`)
          }
          return {
            path: tsconfig.file0.relToDir(file0),
          }
        }),
      ]
    }

    if (settings.addUnitsSrcToPaths) {
      const addUnitsSrcToPaths = settings.addUnitsSrcToPaths
      const scope = addUnitsSrcToPaths.scope
      const unitsScoped = scope === "all" ? units : unit?.deps.map((dep) => dep.unit) || []
      const match = addUnitsSrcToPaths.match
      const { Mono0Unit: Mono0UnitClass } = await import("./unit")
      const unitsFiltered = Mono0UnitClass.filterUnits({ units: unitsScoped, match })
      const unitsDeep = addUnitsSrcToPaths.deepDeps
        ? [...unitsFiltered, ...unitsFiltered.flatMap((d) => d.deps.map((dep) => dep.unit))]
        : unitsFiltered
      result.compilerOptions = {
        ...(result.compilerOptions || {}),
        paths: {
          ...(result.compilerOptions?.paths || {}),
          ...Object.fromEntries(
            unitsDeep.flatMap((d) => [
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
      const unitsDeep = addUnitsDistToPaths.deepDeps
        ? [...unitsFiltered, ...unitsFiltered.flatMap((d) => d.deps.map((dep) => dep.unit))]
        : unitsFiltered
      result.compilerOptions = {
        ...(result.compilerOptions || {}),
        paths: {
          ...(result.compilerOptions?.paths || {}),
          ...Object.fromEntries(
            unitsDeep.flatMap((d) => [
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
    const coreSort = ["extends", "files", "include", "exclude", "compilerOptions", "references"]
    const compilerOptionsSort = [
      "incremental",
      "composite",
      "tsBuildInfoFile",
      "disableSourceOfProjectReferenceRedirect",
      "disableSolutionSearching",
      "disableReferencedProjectLoad",
      "target",
      "module",
      "lib",
      "jsx",
      "experimentalDecorators",
      "emitDecoratorMetadata",
      "jsxFactory",
      "jsxFragmentFactory",
      "jsxImportSource",
      "reactNamespace",
      "noLib",
      "useDefineForClassFields",
      "moduleDetection",
      "resolveJsonModule",
      "baseUrl",
      "paths",
      "rootDirs",
      "rootDir",
      "typeRoots",
      "types",
      "allowUmdGlobalAccess",
      "moduleResolution",
      "resolvePackageJsonExports",
      "resolvePackageJsonImports",
      "customConditions",
      "preserveSymlinks",
      "allowImportingTsExtensions",
      "noResolve",
      "traceResolution",
      "esModuleInterop",
      "allowSyntheticDefaultImports",
      "isolatedModules",
      "verbatimModuleSyntax",
      "moduleSuffixes",
      "resolvePackageJsonMain",
      "declaration",
      "declarationMap",
      "emitDeclarationOnly",
      "sourceMap",
      "inlineSourceMap",
      "inlineSources",
      "outFile",
      "outDir",
      "removeComments",
      "noEmit",
      "noEmitHelpers",
      "noEmitOnError",
      "importsNotUsedAsValues",
      "downlevelIteration",
      "importHelpers",
      "preserveConstEnums",
      "preserveValueImports",
      "skipLibCheck",
      "skipDefaultLibCheck",
      "stripInternal",
      "strict",
      "strictBindCallApply",
      "strictFunctionTypes",
      "strictNullChecks",
      "strictPropertyInitialization",
      "noImplicitAny",
      "noImplicitThis",
      "useUnknownInCatchVariables",
      "alwaysStrict",
      "noFallthroughCasesInSwitch",
      "noUncheckedIndexedAccess",
      "noImplicitOverride",
      "noImplicitReturns",
      "noPropertyAccessFromIndexSignature",
      "exactOptionalPropertyTypes",
      "forceConsistentCasingInFileNames",
      "allowJs",
      "checkJs",
      "maxNodeModuleJsDepth",
      "plugins",
      "watchOptions",
      "assumeChangesOnlyAffectDirectDependencies",
    ]
    const sort = [...coreSort, ...compilerOptionsSort.map((k) => `compilerOptions.${k}`)]
    await this.file0.writeJson(valueParsed, sort, true)
  }

  static mergeSettings(
    ...settings: [
      Mono0Tsconfig.Settings | Mono0Tsconfig.DefinitionSettings,
      ...Array<Mono0Tsconfig.Settings | Mono0Tsconfig.DefinitionSettings>,
    ]
  ): Mono0Tsconfig.Settings {
    const filteredSettings = settings.filter(Boolean) as Array<
      Mono0Tsconfig.Settings | NonNullable<Mono0Tsconfig.DefinitionSettings>
    >
    return filteredSettings.reduce<Mono0Tsconfig.Settings>((acc, setting) => {
      const parsedSetting = Mono0Tsconfig.zDefinitionSettings.parse(setting)
      // biome-ignore lint/performance/noAccumulatingSpread: <x>
      return { ...acc, ...parsedSetting }
    }, {} as Mono0Tsconfig.Settings)
  }

  static mergeRecordsOfDefinitions(
    ...records: [Mono0Tsconfig.RecordOfDefinitions, ...Mono0Tsconfig.RecordOfDefinitions[]]
  ): Mono0Tsconfig.RecordOfDefinitionsParsed {
    return records.reduce<Mono0Tsconfig.RecordOfDefinitionsParsed>((acc, record) => {
      for (const [name, definitionOrValue] of Object.entries(record)) {
        const definition = Mono0Tsconfig.zDefinition.parse(definitionOrValue)
        acc[name] = {
          path: definition.path ?? acc[name]?.path,
          settings: Mono0Tsconfig.mergeSettings(acc[name]?.settings, definition.settings),
          value: Mono0Tsconfig.mergeValue(acc[name]?.value, definition.value),
        }
      }
      return acc
    }, {} as Mono0Tsconfig.RecordOfDefinitionsParsed)
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
            deepDeps: z.boolean().optional().default(false),
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
            deepDeps: z.boolean().optional().default(false),
          }),
        ])
        .optional(),
      clearReferences: z.boolean().optional(),
      addUnitsAsReferences: z
        .union([
          z.boolean(),
          z.string(),
          z.object({
            scope: z
              .enum(["all", "deps"])
              .optional()
              .default("all" as const),
            match: z.string().optional(),
            tsconfig: z.string().optional().default("$core"),
            deepDeps: z.boolean().optional().default(false),
          }),
        ])
        .optional(),
    })
    .optional()
    .default({})
    .transform((val) => {
      return {
        ...omit(val, ["addUnitsSrcToPaths", "addUnitsDistToPaths", "addUnitsAsReferences"]),
        ...(val.addUnitsSrcToPaths === undefined
          ? {}
          : {
              addUnitsSrcToPaths:
                val.addUnitsSrcToPaths === false
                  ? (false as const)
                  : val.addUnitsSrcToPaths === true
                    ? { scope: "all" as const, match: undefined, index: true, deepDeps: false }
                    : typeof val.addUnitsSrcToPaths === "string"
                      ? { scope: "all" as const, match: val.addUnitsSrcToPaths, index: true, deepDeps: false }
                      : val.addUnitsSrcToPaths,
            }),
        ...(val.addUnitsDistToPaths === undefined
          ? {}
          : {
              addUnitsDistToPaths:
                val.addUnitsDistToPaths === false
                  ? (false as const)
                  : val.addUnitsDistToPaths === true
                    ? { scope: "all" as const, match: undefined, index: true, deepDeps: false }
                    : typeof val.addUnitsDistToPaths === "string"
                      ? { scope: "all" as const, match: val.addUnitsDistToPaths, index: true, deepDeps: false }
                      : val.addUnitsDistToPaths,
            }),
        ...(val.addUnitsAsReferences === undefined
          ? {}
          : {
              addUnitsAsReferences:
                val.addUnitsAsReferences === false
                  ? (false as const)
                  : val.addUnitsAsReferences === true
                    ? { scope: "all" as const, match: undefined, deepDeps: false, tsconfig: "$core" }
                    : typeof val.addUnitsAsReferences === "string"
                      ? { scope: "all" as const, match: val.addUnitsAsReferences, deepDeps: false, tsconfig: "$core" }
                      : val.addUnitsAsReferences,
            }),
      }
    })

  static zFullDefinition = z.object({
    path: z.string().optional(),
    settings: Mono0Tsconfig.zDefinitionSettings,
    value: Mono0Tsconfig.zValueDefinition.optional().default({}),
  })

  static zDefinition = z.union([Mono0Tsconfig.zValueDefinition, Mono0Tsconfig.zFullDefinition]).transform(
    (val) =>
      ("path" in val || "value" in val
        ? {
            path: val.path,
            value: val.value,
            settings: Mono0Tsconfig.zDefinitionSettings.parse(val.settings) || {},
          }
        : { path: undefined, value: val, settings: {} }) as Mono0Tsconfig.FullDefinitionParsed,
  )

  static definitionDefault = {
    path: "tsconfig.json",
    value: {},
    settings: {},
  } satisfies Mono0Tsconfig.FullDefinition

  static mergeValue(...tsconfigs: [Mono0Tsconfig.Json, ...Mono0Tsconfig.Json[]]): Mono0Tsconfig.Json {
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

  static getMetaAll({ units, tsconfigs }: { units: Mono0Unit[]; tsconfigs: Mono0Tsconfig[] }) {
    return Promise.all(tsconfigs.map((tsconfig) => tsconfig.getMeta({ units })))
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
  export type RecordOfDefinitions = Record<string, Definition>
  export type RecordOfDefinitionsParsed = Record<string, FullDefinitionParsed>
}
