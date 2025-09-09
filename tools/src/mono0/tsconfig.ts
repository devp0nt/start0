import type { TsConfigJson as TsConfigJsonTypeFest } from "type-fest"
import z from "zod"

export class Mono0Tsconfig {
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

  static mergeHard(...tsconfigs: [Mono0Tsconfig.Json, ...Mono0Tsconfig.Json[]]) {
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
  export type Json = TsConfigJsonTypeFest
  export type Parsed = z.output<typeof Mono0Tsconfig.zDefinition>
}
