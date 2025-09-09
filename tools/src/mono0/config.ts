import type { JsonValue, TsConfigJson as TsConfigJsonTypeFest } from "type-fest"
import z from "zod"
import { Fs0 } from "@/tools/fs0"
import { Mono0Unit } from "@/tools/mono0/unit"

export class Mono0Config {
  rootFs0: Fs0
  configFs0: Fs0
  tsconfigs: Mono0Config.TsconfigsDefinitions
  vars: Mono0Config.Vars
  settings: Mono0Config.Settings
  presets: Mono0Config.Presets

  private constructor(input: {
    rootFs0: Fs0
    configFs0: Fs0
    tsconfigs: Mono0Config.TsconfigsDefinitions
    vars: Mono0Config.Vars
    settings: Mono0Config.Settings
    presets: Mono0Config.Presets
  }) {
    this.rootFs0 = input.rootFs0
    this.configFs0 = input.configFs0
    this.tsconfigs = input.tsconfigs
    this.vars = input.vars
    this.settings = input.settings
    this.presets = input.presets
  }

  static async get({ cwd }: { cwd?: string } = {}) {
    const configFile0 = await Fs0.findUpFile([".mono0rc.json", ".mono0/config.json"], { cwd })
    if (!configFile0) {
      throw new Error(".mono0rc.json or .mono0/config.json not found")
    }
    const configFs0 = configFile0.fs0
    const rootFs0 =
      configFile0.path.dirname === ".mono0"
        ? configFile0.fs0.createFs0({ rootDir: "../", cwd: "../" })
        : configFile0.fs0.createFs0({ cwd: ".", rootDir: "." })

    const configDefinitionRaw = await configFile0.importFresh()
    const configDefinitionParsed = Mono0Config.zDefinition.safeParse(configDefinitionRaw)
    if (!configDefinitionParsed.success) {
      throw new Error("Invalid config file", {
        cause: configDefinitionParsed.error,
      })
    }

    const configDefinition = configDefinitionParsed.data
    const input = {
      rootFs0,
      configFs0,
      tsconfigs: configDefinition.tsconfigs,
      vars: configDefinition.vars,
      settings: configDefinition.settings,
      presets: configDefinition.presets,
    }
    return new Mono0Config(input)
  }

  static zDefinition = z.object({
    tsconfigs: z
      .record(
        z.string(),
        z.object({
          path: z.string(),
          value: z.any(),
        }),
      )
      .optional()
      .default({}),
    vars: z.record(z.string(), z.any()).optional().default({}),
    settings: z
      .object({
        autoIncludeSrc: z.boolean().optional().default(true),
        autoPathSrc: z.boolean().optional().default(true),
        autoPathCycle: z.boolean().optional().default(true),
      })
      .optional()
      .default({
        autoIncludeSrc: true,
        autoPathSrc: true,
        autoPathCycle: true,
      }),
    presets: z
      .record(z.string(), Mono0Unit.zDefinition.omit({ name: true }))
      .optional()
      .default({}),
  })

  getMeta() {
    return {
      tsconfigs: this.tsconfigs,
      vars: this.vars,
      settings: this.settings,
      presets: this.presets,
    }
  }
}

export namespace Mono0Config {
  export type Definition = {
    tsconfigs?: TsconfigsDefinitions
    vars?: Vars
    settings?: Partial<Settings>
    presets?: Presets
  }
  export type TsconfigJson = TsConfigJsonTypeFest
  export type TsconfigDefinition = {
    path: string
    value: TsconfigJson
  }
  export type TsconfigsDefinitions = Record<string, TsconfigDefinition>
  export type Var = JsonValue
  export type Vars = Record<string, Var>
  export type Settings = {
    autoIncludeSrc: boolean
    autoPathSrc: boolean
  }
  export type Preset = Omit<Mono0Unit.Definition, "name">
  export type Presets = Record<string, Preset>
}
