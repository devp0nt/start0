import { Fs0 } from "@devp0nt/fs0"
import z from "zod"
import { Mono0Tsconfig } from "./tsconfig"
import { Mono0Unit } from "./unit"

export class Mono0Config {
  rootFs0: Fs0
  configFs0: Fs0
  tsconfigs: Mono0Config.Tsconfigs
  filesSelectors: Mono0Config.DefinitionParsed["filesSelectors"]
  unitsSelectors: Mono0Config.DefinitionParsed["unitsSelectors"]
  settings: Mono0Config.DefinitionParsed["settings"]
  presets: Mono0Config.DefinitionParsed["presets"]

  private constructor(input: {
    rootFs0: Fs0
    configFs0: Fs0
    tsconfigs: Mono0Config.Tsconfigs
    filesSelectors: Mono0Config.DefinitionParsed["filesSelectors"]
    unitsSelectors: Mono0Config.DefinitionParsed["unitsSelectors"]
    settings: Mono0Config.DefinitionParsed["settings"]
    presets: Mono0Config.DefinitionParsed["presets"]
  }) {
    this.rootFs0 = input.rootFs0
    this.configFs0 = input.configFs0
    this.tsconfigs = input.tsconfigs
    this.filesSelectors = input.filesSelectors
    this.unitsSelectors = input.unitsSelectors
    this.settings = input.settings
    this.presets = input.presets
  }

  static async get({ cwd }: { cwd?: string } = {}) {
    const configFile0 = await Fs0.findUpFile([".mono0rc.json", ".mono0/config.json"], { cwd })
    if (!configFile0) {
      throw new Error(".mono0rc.json or .mono0/config.json not found")
    }
    const rootFs0 =
      configFile0.path.dirname === ".mono0"
        ? configFile0.fs0.createFs0({ rootDir: "../", cwd: "../" })
        : configFile0.fs0.createFs0({ cwd: ".", rootDir: "." })
    configFile0.setRootDir(rootFs0.rootDir)
    const configFs0 = configFile0.fs0

    const configDefinitionRaw = await configFile0.importFresh()
    const configDefinitionParsed = Mono0Config.zDefinition.safeParse(configDefinitionRaw)
    if (!configDefinitionParsed.success) {
      throw new Error("Invalid config file", {
        cause: configDefinitionParsed.error,
      })
    }

    const configDefinition = configDefinitionParsed.data
    const config = new Mono0Config({
      rootFs0,
      configFs0,
      tsconfigs: {},
      filesSelectors: configDefinition.filesSelectors,
      unitsSelectors: configDefinition.unitsSelectors,
      settings: configDefinition.settings,
      presets: configDefinition.presets,
    })

    const tsconfigs = Object.fromEntries(
      Object.entries(configDefinition.tsconfigs).map(([key, value]) => {
        return [key, Mono0Tsconfig.create({ definition: value, config, fs0: configFile0.fs0 })]
      }),
    )
    config.tsconfigs = tsconfigs

    return config
  }

  static zDefinition = z.object({
    tsconfigs: z.record(z.string(), Mono0Tsconfig.zDefinition).optional().default({}),
    filesSelectors: z.record(z.string(), z.array(z.string())).optional().default({}),
    unitsSelectors: z.record(z.string(), z.array(z.string())).optional().default({}),
    settings: z
      .object({
        installCommand: z.string().optional(),
      })
      .optional()
      .default({}),
    presets: z
      .record(z.string(), Mono0Unit.zDefinition.omit({ name: true }))
      .optional()
      .default({}),
  })

  getMeta({ units }: { units: Mono0Unit[] }) {
    return {
      tsconfigs: Object.fromEntries(
        Object.entries(this.tsconfigs).map(([key, tsconfig]) => [key, tsconfig.getMeta({ units })]),
      ),
      filesSelectors: this.filesSelectors,
      unitsSelectors: this.unitsSelectors,
      settings: this.settings,
      presets: this.presets,
    }
  }
}

export namespace Mono0Config {
  export type Definition = {
    tsconfigs?: TsconfigsDefinitions
    filesSelectors?: FilesSelectors
    unitsSelectors?: UnitsSelectors
    settings?: Partial<Settings>
    presets?: Presets
  }
  export type DefinitionParsed = z.output<typeof Mono0Config.zDefinition>
  export type TsconfigsDefinitions = Record<string, Mono0Tsconfig.FullDefinition>
  export type Tsconfigs = Record<string, Mono0Tsconfig>
  export type FilesSelector = string[]
  export type FilesSelectors = Record<string, FilesSelector>
  export type UnitsSelector = string[]
  export type UnitsSelectors = Record<string, UnitsSelector>
  export type Settings = z.output<typeof Mono0Config.zDefinition.shape.settings>
  export type Preset = Omit<Mono0Unit.Definition, "name">
  export type Presets = Record<string, Preset>
}
