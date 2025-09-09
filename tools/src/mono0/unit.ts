import type { TsConfigJson as TsConfigJsonTypeFest } from "type-fest"
import z from "zod"
import { File0, Fs0 } from "@/tools/fs0"
import type { Mono0Config } from "@/tools/mono0/config"

export class Mono0Unit {
  unitConfigFile0: File0
  fs0: Fs0
  config: Mono0Config
  name: string
  tags: string[]
  tsconfig: Mono0Unit.TsconfigFullDefinition

  private constructor(input: {
    unitConfigFile0: File0
    fs0: Fs0
    config: Mono0Config
    name: string
    tags: string[]
    tsconfig: Mono0Unit.TsconfigFullDefinition
  }) {
    this.unitConfigFile0 = input.unitConfigFile0
    this.fs0 = input.fs0
    this.config = input.config
    this.name = input.name
    this.tags = input.tags
    this.tsconfig = input.tsconfig
  }

  static async create({ unitConfigPath, config }: { unitConfigPath: string; config: Mono0Config }) {
    const unitConfigFile0 = File0.create({ filePath: unitConfigPath })
    const definitionRaw = await unitConfigFile0.readJson<Mono0Unit.Definition>()
    const definitionParsed = Mono0Unit.zDefinition.safeParse(definitionRaw)
    if (!definitionParsed.success) {
      throw new Error(`Invalid unit definition: ${unitConfigPath}`, {
        cause: definitionParsed.error,
      })
    }
    const definition = definitionParsed.data
    return new Mono0Unit({
      name: definition.name,
      tags: definition.tags,
      tsconfig: definition.tsconfig,
      unitConfigFile0,
      fs0: unitConfigFile0.fs0,
      config,
    })
  }

  static zDefinition = z.object({
    name: z.string(),
    tags: z.array(z.string()).optional().default([]),
    tsconfig: z.any().optional().default({}),
  })

  getMeta() {
    return {
      name: this.name,
      tags: this.tags,
      path: this.config.rootFs0.toRel(this.fs0.cwd),
    }
  }
}

export namespace Mono0Unit {
  export type Definition = {
    name: string
    preset?: string | string[]
    tags?: string[]
    deps?: string[]
    tsconfig?: TsconfigDefinition
  }
  export type TsconfigJson = TsConfigJsonTypeFest
  export type TsconfigFullDefinition = {
    path: string
    value: TsconfigJson
  }
  export type TsconfigDefinition = TsconfigJson | TsconfigFullDefinition
}
