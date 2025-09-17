import nodePath from 'node:path'
import { type File0, Fs0 } from '@devp0nt/fs0'
import pick from 'lodash-es/pick.js'
import z from 'zod'
import type { Mono0Config } from './config'
import { Mono0Logger } from './logger'
import { Mono0PackageJson } from './packageJson'
import { Mono0Tsconfig } from './tsconfig'
import { omit } from './utils'

export class Mono0Unit {
  unitConfigFile0: File0
  fs0: Fs0
  srcFs0: Fs0
  distFs0: Fs0
  indexFile0: File0 | undefined
  config: Mono0Config
  generalTsconfigs: Mono0Tsconfig[]
  name: string
  tags: string[]
  // tsconfig: Mono0Tsconfig
  tsconfigs: Mono0Tsconfig[]
  packageJson: Mono0PackageJson
  presets: string[]
  depsDefs: Mono0Unit.DefinitionParsed['deps']
  deps: Mono0Unit.Dependency[]
  settings: Mono0Unit.DefinitionSettings
  filesPaths: string[]
  dirsPaths: string[]

  static logger: Mono0Logger = Mono0Logger.create('unit')
  logger: Mono0Logger = Mono0Unit.logger

  private constructor(input: {
    unitConfigFile0: File0
    fs0: Fs0
    srcFs0: Fs0
    distFs0: Fs0
    indexFile0: File0 | undefined
    config: Mono0Config
    generalTsconfigs: Mono0Tsconfig[]
    name: string
    tags: string[]
    // tsconfig: Mono0Tsconfig
    tsconfigs: Mono0Tsconfig[]
    packageJson: Mono0PackageJson
    presets: string[]
    deps: Mono0Unit.Dependency[]
    depsDefs: Mono0Unit.DefinitionParsed['deps']
    settings: Mono0Unit.DefinitionSettings
    filesPaths: string[]
    dirsPaths: string[]
  }) {
    this.unitConfigFile0 = input.unitConfigFile0
    this.fs0 = input.fs0
    this.srcFs0 = input.srcFs0
    this.distFs0 = input.distFs0
    this.indexFile0 = input.indexFile0
    this.config = input.config
    this.generalTsconfigs = input.generalTsconfigs
    this.name = input.name
    this.tags = input.tags
    // this.tsconfig = input.tsconfig
    this.tsconfigs = input.tsconfigs
    this.packageJson = input.packageJson
    this.presets = input.presets
    this.deps = input.deps
    this.depsDefs = input.depsDefs
    this.settings = input.settings
    this.filesPaths = input.filesPaths
    this.dirsPaths = input.dirsPaths
  }

  static async create({
    unitConfigPath,
    config,
    generalTsconfigs,
  }: {
    unitConfigPath: string
    config: Mono0Config
    generalTsconfigs: Mono0Tsconfig[]
  }) {
    const unitConfigFile0 = config.rootFs0.createFile0(unitConfigPath)
    const definitionRaw = await unitConfigFile0.readJson<Mono0Unit.Definition>()
    const definitionParsed = Mono0Unit.zDefinition.safeParse(definitionRaw)
    if (!definitionParsed.success) {
      throw new Error(`Invalid unit definition: ${unitConfigPath}`, {
        cause: definitionParsed.error,
      })
    }
    const definitionWithAppliedPresets = Mono0Unit.applyPresetsToDefinition({
      definition: definitionParsed.data,
      config,
      unitConfigFile0,
    })
    const definition = Mono0Unit.parseDepsDefsInDefinition({
      definition: definitionWithAppliedPresets,
      config,
      unitConfigFile0,
    })
    const srcFs0 = (await unitConfigFile0.fs0.isExists('src'))
      ? unitConfigFile0.fs0.createFs0({ cwd: 'src' })
      : unitConfigFile0.fs0
    const tsconfigs: Mono0Tsconfig[] = Object.entries(definition.tsconfigs).map(([name, tsconfigDefinition]) =>
      Mono0Tsconfig.create({
        name,
        definition: tsconfigDefinition,
        config,
        generalTsconfigs,
        fs0: unitConfigFile0.fs0,
        unit: undefined,
      }),
    )
    const packageJson = Mono0PackageJson.create({
      name: definition.name,
      definition: definition.packageJson,
      config,
      fs0: unitConfigFile0.fs0,
    })
    const packageJsonName = config.packageJson.value.name ?? 'unknown'
    const name = definition.name ?? `@${packageJsonName}/${unitConfigFile0.path.dirname}`
    const unit = new Mono0Unit({
      name,
      tags: definition.tags,
      // tsconfig,
      tsconfigs,
      packageJson,
      presets: definition.preset,
      unitConfigFile0,
      fs0: unitConfigFile0.fs0,
      srcFs0,
      generalTsconfigs,
      // will be overrided below
      distFs0: srcFs0,
      // will be overrided below
      indexFile0: undefined,
      config,
      deps: [],
      depsDefs: definition.deps,
      settings: definition.settings,
      filesPaths: [],
      dirsPaths: [],
    })
    for (const tsconfig of unit.tsconfigs) {
      tsconfig.unit = unit
    }
    unit.packageJson.unit = unit
    const tsconfigCore = unit.tsconfigs.find((t) => t.name === 'core')
    const tsconfig = tsconfigCore || unit.tsconfigs[0]
    const { value: tsconfigValue } = await tsconfig.getNewValue({ units: [] })
    const outDir = tsconfigValue.compilerOptions?.outDir || './dist'
    const distFs0 = tsconfig.file0.fs0.createFs0({ cwd: outDir })
    unit.distFs0 = distFs0
    const includeGlob = tsconfigValue.include ?? []
    const exclude = tsconfigValue.exclude ?? []
    const excludeGlob = exclude.map((e) => `!${e}`)
    const filesPaths = await tsconfig.file0.fs0.glob([...includeGlob, ...excludeGlob])
    unit.filesPaths = filesPaths.sort()
    const dirsPaths = [...new Set(filesPaths.map((filePath) => nodePath.dirname(filePath)))]
    unit.dirsPaths = dirsPaths.sort()
    const indexFile0 = await (async () => {
      const exts = ['.ts', '.tsx', '.js', '.jsx']
      for (const ext of exts) {
        const exists = await srcFs0.isExists(`index${ext}`)
        if (exists) {
          return srcFs0.createFile0(`index${ext}`)
        }
      }
      return undefined
    })()
    unit.indexFile0 = indexFile0
    return unit
  }

  static applyPresetsToDefinition({
    definition,
    config,
    unitConfigFile0,
    level = 0,
  }: {
    definition: Mono0Unit.DefinitionParsed
    config: Mono0Config
    unitConfigFile0: File0
    level?: number
  }): Mono0Unit.DefinitionParsed {
    if (level > 10) {
      throw new Error(`Preset recursion limit reached for "${unitConfigFile0.path.rel}"`)
    }
    const forcePreset = config.presets.force
    const presets = [...(forcePreset ? ['force'] : []), ...definition.preset]
    let result = { ...definition, preset: [] } as Mono0Unit.DefinitionParsed
    for (const presetName of presets.reverse()) {
      const presetValue = config.presets[presetName]
      if (!presetValue) {
        throw new Error(`Preset "${presetName}" not found in "${unitConfigFile0.path.rel}"`)
      }
      result = {
        ...result,
        tags: [...(presetValue.tags ?? []), ...result.tags],
        deps: [...(presetValue.deps ?? []), ...result.deps],
        settings: Mono0Unit.mergeSettings(presetValue.settings, result.settings),
        tsconfigs: Mono0Tsconfig.mergeRecordsOfDefinitions(presetValue.tsconfigs, result.tsconfigs),
        packageJson: Mono0PackageJson.mergeDefinitions(presetValue.packageJson, result.packageJson),
        preset: presetValue.preset,
      }
    }
    if (result.preset.length > 0) {
      return Mono0Unit.applyPresetsToDefinition({ definition: result, config, unitConfigFile0, level: level + 1 })
    }
    return result
  }

  static parseDepsDefsInDefinition({
    definition,
    config,
    unitConfigFile0,
  }: {
    definition: Mono0Unit.DefinitionParsed
    config: Mono0Config
    unitConfigFile0: File0
  }): Mono0Unit.DefinitionParsed {
    const parsedDepsDefs: Mono0Unit.DependencyDefinitionParsed[] = []
    for (const dd of definition.deps) {
      if (dd.match.name?.startsWith('$')) {
        const unitSelectorName = dd.match.name.slice(1)
        const unitsSelector = config.unitsSelectors[unitSelectorName]
        if (!unitsSelector) {
          throw new Error(`Unit selector "${unitSelectorName}" not found in "${unitConfigFile0.path.rel}"`)
        }
        const parsedDds = unitsSelector.map((match) => {
          const matchParsed = Mono0Unit.parseMatchString(match)
          return {
            match: matchParsed,
            relation: dd.relation,
          }
        })
        parsedDepsDefs.push(...parsedDds)
      } else {
        parsedDepsDefs.push(dd)
      }
    }
    return {
      ...definition,
      deps: parsedDepsDefs,
    }
  }

  applyDeps({ units }: { units: Mono0Unit[] }) {
    for (const unit of units) {
      const hasMatchResult = unit.hasMatchByDepsDefs(this.depsDefs)
      if (hasMatchResult.hasMatch && this.name !== hasMatchResult.unit.name) {
        this.deps.push({
          unit: hasMatchResult.unit,
          relation: hasMatchResult.relation,
        })
      }
    }
  }
  static applyDeps({ units }: { units: Mono0Unit[] }) {
    for (const unit of units) {
      unit.applyDeps({ units })
    }
  }

  async writeTsconfigs({ units }: { units: Mono0Unit[] }) {
    await Promise.all(this.tsconfigs.map((tsconfig) => tsconfig.write({ units })))
  }

  async writePackageJson({ units }: { units: Mono0Unit[] }) {
    return await this.packageJson.write({ units })
  }

  hasMatchByMatchParsed(m: Mono0Unit.DependencyMatchParsed) {
    const matchByName = m.name ? Fs0.isStringMatch(this.name, m.name) : undefined
    const matchByTagsInclude =
      m.tagsInclude.length > 0 ? m.tagsInclude.every((tag) => this.tags.includes(tag)) : undefined
    const matchByTagsExclude =
      m.tagsExclude.length > 0 ? m.tagsExclude.every((tag) => !this.tags.includes(tag)) : undefined
    const matches = [matchByName, matchByTagsInclude, matchByTagsExclude].filter((v) => v !== undefined)
    return matches.length > 0 && matches.every((v) => v)
  }

  hasMatchByDepsDefs(
    // dds = deps definitions
    dds: Mono0Unit.DefinitionParsed['deps'],
  ):
    | { hasMatch: true; unit: Mono0Unit; relation: Mono0Unit.DependencyRelationType }
    | { hasMatch: false; unit: undefined; relation: undefined } {
    for (const dd of dds) {
      if (this.hasMatchByMatchParsed(dd.match)) {
        return { hasMatch: true, unit: this, relation: dd.relation }
      }
    }
    return { hasMatch: false, unit: undefined, relation: undefined }
  }

  static filterUnits({ units, match }: { units: Mono0Unit[]; match: string | undefined }) {
    if (!match) {
      return units
    }
    const matchParsed = Mono0Unit.parseMatchString(match)
    return units.filter((unit) => unit.hasMatchByMatchParsed(matchParsed))
  }

  // #backend,#lib,!#site
  static parseMatchString(match: string): Mono0Unit.DependencyMatchParsed {
    const result = {
      name: undefined,
      tagsInclude: [],
      tagsExclude: [],
    } as Mono0Unit.DependencyMatchParsed
    const parts = match.split(',')
    for (const part of parts) {
      if (part.startsWith('#')) {
        result.tagsInclude.push(part.slice(1))
      } else if (part.startsWith('!')) {
        result.tagsExclude.push(part.slice(2))
      } else {
        result.name = part
      }
    }
    return result
  }

  static async findAndCreateUnits({
    rootFs0,
    config,
    generalTsconfigs,
  }: {
    rootFs0: Fs0
    config: Mono0Config
    generalTsconfigs: Mono0Tsconfig[]
  }) {
    console.log(11, rootFs0.cwd, rootFs0.rootDir)
    const unitsConfigsPaths = await rootFs0.glob(config.unitsConfigsGlob)
    console.log(10)
    if (!unitsConfigsPaths.length) {
      return []
    }
    const unitsUnsorted = await Promise.all(
      unitsConfigsPaths.map((unitConfigPath) => Mono0Unit.create({ unitConfigPath, config, generalTsconfigs })),
    )
    const units = Mono0Unit.sortFromIndependentToDependent({ units: unitsUnsorted })
    await Mono0Unit.applyDeps({ units })
    return units
  }

  static sortFromIndependentToDependent({ units }: { units: Mono0Unit[] }) {
    units = units.sort((a, b) => a.name.localeCompare(b.name))
    // Build adjacency list (deps graph)
    const graph = new Map<Mono0Unit, Mono0Unit[]>()
    const indegree = new Map<Mono0Unit, number>()

    for (const unit of units) {
      graph.set(unit, [])
      indegree.set(unit, 0)
    }

    for (const unit of units) {
      for (const dep of unit.deps) {
        // unit depends on dep.unit → edge: dep.unit → unit
        // graph.get(dep.unit)!.push(unit)
        const neighbors = graph.get(dep.unit)
        if (!neighbors) {
          // impossible error
          throw new Error(`Unit "${unit.name}" depends on unit "${dep.unit.name}" that is not in the graph`)
        }
        neighbors.push(unit)
        indegree.set(unit, (indegree.get(unit) ?? 0) + 1)
      }
    }

    // Kahn’s algorithm
    const queue: Mono0Unit[] = []
    for (const [unit, deg] of indegree) {
      if (deg === 0) queue.push(unit)
    }

    const result: Mono0Unit[] = []
    while (queue.length > 0) {
      const current = queue.shift()
      if (!current) {
        // impossible error
        throw new Error('Queue is empty')
      }
      result.push(current)

      for (const neighbor of graph.get(current) ?? []) {
        const neighborIndegree = indegree.get(neighbor)
        if (!neighborIndegree) {
          // impossible error
          throw new Error(`Unit "${current.name}" depends on unit "${neighbor.name}" that is not in the indegree map`)
        }
        indegree.set(neighbor, neighborIndegree - 1)
        if (indegree.get(neighbor) === 0) {
          queue.push(neighbor)
        }
      }
    }

    if (result.length !== units.length) {
      this.logger.error('🔴 Cyclic dependency detected between units')
      return result
    }

    return result
  }

  static mergeSettings(
    ...settings: [
      Mono0Unit.Settings | Mono0Unit.DefinitionSettings,
      ...Array<Mono0Unit.Settings | Mono0Unit.DefinitionSettings>,
    ]
  ): Mono0Unit.Settings {
    const filteredSettings = settings.filter(Boolean) as Array<
      Mono0Unit.Settings | NonNullable<Mono0Unit.DefinitionSettings>
    >
    return filteredSettings.reduce<Mono0Unit.Settings>((acc, setting) => {
      const parsedSetting = Mono0Unit.zDefinitionSettings.parse(setting)
      // biome-ignore lint/performance/noAccumulatingSpread: <x>
      return { ...acc, ...parsedSetting }
    }, {} as Mono0Unit.Settings)
  }

  static zDefinitionSettings = z.object({})

  static zDefinitionDeps = z
    .array(
      z.union([
        z.string(),
        z.object({
          match: z.string().transform(Mono0Unit.parseMatchString),
          relation: z.enum(['reference', 'include', 'none']).optional().default('reference'),
        }),
      ]),
    )
    .optional()
    .default([])
    .transform((val) =>
      val.map((v) =>
        typeof v === 'string' ? { match: Mono0Unit.parseMatchString(v), relation: 'reference' as const } : v,
      ),
    )

  static zDefinition = z
    .object({
      name: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      tsconfig: Mono0Tsconfig.zDefinition.optional(),
      tsconfigs: z.record(z.string(), Mono0Tsconfig.zDefinition).optional(),
      packageJson: Mono0PackageJson.zDefinition.optional().default(Mono0PackageJson.definitionDefault),
      preset: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .default([])
        .transform((val) => (Array.isArray(val) ? val : [val])),
      settings: Mono0Unit.zDefinitionSettings.optional().default({}),
      deps: Mono0Unit.zDefinitionDeps,
    })
    .transform((val) => {
      const tsconfigs: Record<string, Mono0Tsconfig.FullDefinitionParsed> = {}
      if (val.tsconfig) {
        tsconfigs.core = Mono0Tsconfig.zDefinition.parse(val.tsconfig)
      }
      if (val.tsconfigs) {
        Object.assign(
          tsconfigs,
          Object.fromEntries(
            Object.entries(val.tsconfigs).map(([name, v]) => [name, Mono0Tsconfig.zDefinition.parse(v)]),
          ),
        )
      }
      return {
        ...omit(val, ['tsconfig', 'tsconfigs']),
        tsconfigs,
      }
    })

  static getFilePathRelativeToPackageName({ absFilePath, units }: { absFilePath: string; units: Mono0Unit[] }) {
    for (const unit of units) {
      if (unit.filesPaths.includes(absFilePath)) {
        const relFilePath = unit.srcFs0.toRel(absFilePath)
        return nodePath.join(unit.name, relFilePath)
      }
    }
    return absFilePath
  }

  getPathInDistByPathInSrc(absPathInSrc: string) {
    const distDir = this.distFs0.cwd
    const srcDir = this.srcFs0.cwd
    const pathInDist = absPathInSrc.replace(srcDir, distDir)
    return pathInDist
  }

  async getMeta({ units, pickKeys }: { units: Mono0Unit[]; pickKeys?: string[] }) {
    const result = {
      name: this.name,
      tags: this.tags,
      path: this.config.rootFs0.toRel(this.fs0.cwd),
      presets: this.presets,
      settings: this.settings,
      tsconfigs: await Mono0Tsconfig.getMetaAll({ units, tsconfigs: this.tsconfigs }),
      packageJson: await this.packageJson.getMeta({ units }),
      deps: this.deps.map((d) => d.unit.name),
      filesPaths: this.filesPaths,
      dirsPaths: this.dirsPaths,
    }
    if (pickKeys) {
      return pick(result, pickKeys)
    }
    return result
  }

  static getMetaAll({
    units,
    match,
    pickKeys,
  }: {
    units: Mono0Unit[]
    match?: string
    pickKeys: string[] | undefined
  }) {
    const unitsFiltered = Mono0Unit.filterUnits({ units, match })
    return Promise.all(unitsFiltered.map((unit) => unit.getMeta({ units: unitsFiltered, pickKeys })))
  }
}

export namespace Mono0Unit {
  export type Definition = {
    name: string
    preset?: string | string[]
    tags?: string[]
    deps?: DependencyDefinition[]
    settings?: Partial<DefinitionSettings>
    tsconfig?: Mono0Tsconfig.Definition
  }
  export type DefinitionParsed = z.output<typeof Mono0Unit.zDefinition>
  export type DependencyDefinitionParsed = z.output<typeof Mono0Unit.zDefinitionDeps>[number]

  export type Settings = Record<never, never> // Partial<z.input<typeof Mono0Unit.zDefinitionSettings>>
  export type DefinitionSettings = Record<never, never> // z.output<typeof Mono0Unit.zDefinitionSettings>
  export type DependencyRelationType = 'reference' | 'include' | 'none'
  export type DependencyMatchDefinition = string // tags or name
  export type DependencyMatchParsed = {
    name?: string
    tagsInclude: string[]
    tagsExclude: string[]
  }
  export type DependencyFullDefenition = {
    match: DependencyMatchDefinition
    relation?: DependencyRelationType
  }
  export type DependencyDefinition = DependencyMatchDefinition | DependencyFullDefenition
  export type Dependency = {
    unit: Mono0Unit
    relation: DependencyRelationType
  }
}
