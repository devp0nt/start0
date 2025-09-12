import z from "zod"
import { File0, type Fs0 } from "@/tools/fs0"
import type { Mono0Config } from "@/tools/mono0/config"
import { Mono0Tsconfig } from "@/tools/mono0/tsconfig"

export class Mono0Unit {
  unitConfigFile0: File0
  fs0: Fs0
  config: Mono0Config
  name: string
  tags: string[]
  tsconfig: Mono0Unit.TsconfigFullDefinition
  presets: string[]
  depsDefs: Mono0Unit.DefinitionParsed["deps"]
  deps: Mono0Unit.Dependency[]

  private constructor(input: {
    unitConfigFile0: File0
    fs0: Fs0
    config: Mono0Config
    name: string
    tags: string[]
    tsconfig: Mono0Unit.TsconfigFullDefinition
    presets: string[]
    deps: Mono0Unit.Dependency[]
    depsDefs: Mono0Unit.DefinitionParsed["deps"]
  }) {
    this.unitConfigFile0 = input.unitConfigFile0
    this.fs0 = input.fs0
    this.config = input.config
    this.name = input.name
    this.tags = input.tags
    this.tsconfig = input.tsconfig
    this.presets = input.presets
    this.deps = input.deps
    this.depsDefs = input.depsDefs
  }

  static async create({ unitConfigPath, config }: { unitConfigPath: string; config: Mono0Config }) {
    const unitConfigFile0 = config.rootFs0.createFile0(unitConfigPath)
    const definitionRaw = await unitConfigFile0.readJson<Mono0Unit.Definition>()
    const definitionParsed = Mono0Unit.zDefinition.safeParse(definitionRaw)
    if (!definitionParsed.success) {
      throw new Error(`Invalid unit definition: ${unitConfigPath}`, {
        cause: definitionParsed.error,
      })
    }
    const definition = Mono0Unit.applyPresets({ definition: definitionParsed.data, config, unitConfigFile0 })
    // TODO:ASAP create tsconfig file
    return new Mono0Unit({
      name: definition.name,
      tags: definition.tags,
      tsconfig: definition.tsconfig as Mono0Unit.TsconfigFullDefinition,
      presets: definition.preset,
      unitConfigFile0,
      fs0: unitConfigFile0.fs0,
      config,
      deps: [],
      depsDefs: definition.deps,
    })
  }

  static applyPresets({
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
    const presets = definition.preset
    let result = { ...definition, preset: [] } as Mono0Unit.DefinitionParsed
    for (const presetName of presets) {
      const presetValue = config.presets[presetName]
      if (!presetValue) {
        throw new Error(`Preset "${presetName}" not found in "${unitConfigFile0.path.rel}"`)
      }
      result = {
        ...result,
        tags: [...(presetValue.tags ?? []), ...result.tags],
        deps: [...(presetValue.deps ?? []), ...result.deps],
        tsconfig: Mono0Tsconfig.mergeHard(presetValue.tsconfig, result.tsconfig),
        preset: presetValue.preset,
      }
    }
    if (result.preset.length > 0) {
      return Mono0Unit.applyPresets({ definition: result, config, unitConfigFile0, level: level + 1 })
    }
    return result
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

  hasMatchByMatchParsed(m: Mono0Unit.DependencyMatchParsed) {
    const matchByName = m.name ? this.name === m.name : undefined
    const matchByTagsInclude =
      m.tagsInclude.length > 0 ? m.tagsInclude.every((tag) => this.tags.includes(tag)) : undefined
    const matchByTagsExclude =
      m.tagsExclude.length > 0 ? m.tagsExclude.some((tag) => this.tags.includes(tag)) : undefined
    const matches = [matchByName, matchByTagsInclude, matchByTagsExclude].filter((v) => v !== undefined)
    return matches.length > 0 && matches.every((v) => v)
  }

  hasMatchByDepsDefs(
    dds: Mono0Unit.DefinitionParsed["deps"],
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

  // #backend,#lib,!#site
  static parseMatchString(match: string): Mono0Unit.DependencyMatchParsed {
    const result = {
      name: undefined,
      tagsInclude: [],
      tagsExclude: [],
    } as Mono0Unit.DependencyMatchParsed
    const parts = match.split(",")
    for (const part of parts) {
      if (part.startsWith("#")) {
        result.tagsInclude.push(part.slice(1))
      } else if (part.startsWith("!")) {
        result.tagsExclude.push(part.slice(2))
      } else {
        result.name = part
      }
    }
    return result
  }

  static zDefinition = z.object({
    name: z.string(),
    tags: z.array(z.string()).optional().default([]),
    tsconfig: Mono0Tsconfig.zDefinition.optional().default({}),
    preset: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .default([])
      .transform((val) => (Array.isArray(val) ? val : [val])),
    deps: z
      .array(
        z.union([
          z.string(),
          z.object({
            match: z.string().transform(Mono0Unit.parseMatchString),
            relation: z.enum(["reference", "source"]).optional().default("reference"),
          }),
        ]),
      )
      .optional()
      .default([])
      .transform((val) =>
        val.map((v) =>
          typeof v === "string" ? { match: Mono0Unit.parseMatchString(v), relation: "reference" as const } : v,
        ),
      ),
  })

  getMeta() {
    return {
      name: this.name,
      tags: this.tags,
      path: this.config.rootFs0.toRel(this.fs0.cwd),
      presets: this.presets,
      tsconfig: this.tsconfig,
      deps: this.deps.map((d) => d.unit.name),
    }
  }
}

export namespace Mono0Unit {
  export type Definition = {
    name: string
    preset?: string | string[]
    tags?: string[]
    deps?: DependencyDefinition[]
    tsconfig?: TsconfigDefinition
  }
  export type DefinitionParsed = z.output<typeof Mono0Unit.zDefinition>
  export type TsconfigFullDefinition = {
    path: string
    value: Mono0Tsconfig.Json
  }
  export type TsconfigDefinition = Mono0Tsconfig.Json | TsconfigFullDefinition

  export type DependencyRelationType = "reference" | "source"
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
