import type { TsConfigJson as TsConfigJsonTypeFest } from "type-fest"
import z from "zod"
import type { File0 } from "@/tools/fs0"
import type { Mono0Config } from "@/tools/mono0/config"

export class Mono0Tsconfig {
  file0: File0
  config: Mono0Config

  private constructor() {}

  static zDefinition = z.looseObject({
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

  static mergeHard(...tsconfigs: [Mono0Tsconfig.Json, ...Mono0Tsconfig.Json[]]): Mono0Tsconfig.Json {
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
}

export namespace Mono0Tsconfig {
  export type Json = Omit<TsConfigJsonTypeFest, "extends"> & { extends?: string }
  export type Parsed = z.output<typeof Mono0Tsconfig.zDefinition>
}
