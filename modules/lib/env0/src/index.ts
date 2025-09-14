import { Error0 } from "@devp0nt/error0"
import z from "zod"

export class Env0 {
  static create = <TZodSchema extends z.ZodObject<any>>({
    schema: schemaOrFn,
    source,
  }: {
    schema: TZodSchema | ((helpers: Env0.Helpers) => TZodSchema)
    source: Record<string, unknown>
  }) => {
    const helpers = this.getHelpers(source)
    const schema = typeof schemaOrFn === "function" ? schemaOrFn(helpers) : schemaOrFn
    const parseResult = schema.safeParse(source)
    if (!parseResult.success) {
      throw new Error0({
        tag: "env",
        // message: `Invalid environment variables: ${z.prettifyError(parseResult.error)}`,
        message: `Invalid environment variables: ${JSON.stringify(z.flattenError(parseResult.error))}`,
      })
    }
    const data = parseResult.data
    return {
      ...data,
      isLocalHostEnv: data.HOST_ENV === "local",
      isNotLocalHostEnv: data.HOST_ENV !== "local",
      isDevHostEnv: data.HOST_ENV === "dev",
      isStageHostEnv: data.HOST_ENV === "stage",
      isProdHostEnv: data.HOST_ENV === "prod",
      isTestNodeEnv: data.NODE_ENV === "test",
      isDevelopmentNodeEnv: data.NODE_ENV === "development",
      isProductionNodeEnv: data.NODE_ENV === "production",
    }
  }

  static zNodeEnv = z.enum(["development", "production", "test"])
  static zHostEnv = z.enum(["local", "dev", "stage", "prod"])
  static zString = z.string().trim().min(1)
  static zStringOptional = z.union([
    z.literal(undefined).transform(() => undefined),
    z
      .string()
      .trim()
      .transform((val) => val || undefined),
  ])
  static zBoolean = z.union([
    this.zString
      .refine((val) => ["true", "false", "1", "0"].includes(val), `Should be: 'true' | 'false' | '1' | '0' | boolean`)
      .transform((val) => val === "true" || val === "1"),
    z.boolean(),
  ])
  static zBooleanOptional = z.union([
    z.literal("").transform(() => undefined),
    z.literal(undefined).transform(() => undefined),
    this.zBoolean,
  ])
  static zNumber = z.union([
    this.zString.refine((val) => !Number.isNaN(Number(val)), "Should be a number").transform(Number),
    z.number(),
  ])
  static zNumberOptional = z.union([z.literal("").transform(() => undefined), z.literal(undefined), this.zNumber])
  static zInt = z.union([
    this.zString.refine((val) => Number.isInteger(Number(val)), "Should be integer").transform(Number),
    z.number().int(),
  ])
  static zIntOptional = z.union([z.literal("").transform(() => undefined), z.literal(undefined), this.zInt])

  static getHelpers = (source: Record<string, unknown>) => {
    return {
      optionalOnLocalHostEnv: <T extends z.ZodTypeAny>(value: T) => {
        if (source.HOST_ENV !== "local") {
          return value
        }
        return z.union([z.literal(undefined), z.literal("").transform(() => undefined), value])
      },
      optionalOnNotLocalHostEnv: <T extends z.ZodTypeAny>(value: T) => {
        if (source.HOST_ENV === "local") {
          return z.literal(undefined)
        }
        return z.union([z.literal(undefined), z.literal("").transform(() => undefined), value])
      },
      optionalOnProdHostEnv: <T extends z.ZodTypeAny>(value: T) => {
        if (source.HOST_ENV === "prod") {
          return value
        }
        return z.union([z.literal(undefined), z.literal("").transform(() => undefined), value])
      },
      optionalOnNotProdHostEnv: <T extends z.ZodTypeAny>(value: T) => {
        if (source.HOST_ENV === "prod") {
          return z.literal(undefined)
        }
        return z.union([z.literal(undefined), z.literal("").transform(() => undefined), value])
      },
    }
  }
}

export namespace Env0 {
  export type Helpers = ReturnType<typeof Env0.getHelpers>
  export type Type = ReturnType<typeof Env0.create>
}
