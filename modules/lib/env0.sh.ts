import { Error0 } from "@shmoject/modules/lib/error0.sh"
import z from "zod"

export namespace Env0 {
  export const create = <TZodSchema extends z.ZodObject<any>>({
    schema: schemaOrFn,
    source,
  }: {
    schema: TZodSchema | ((helpers: Helpers) => TZodSchema)
    source: Record<string, unknown>
  }) => {
    const helpers = getHelpers(source)
    const schema =
      typeof schemaOrFn === "function" ? schemaOrFn(helpers) : schemaOrFn
    const parseResult = schema.safeParse(source)
    if (!parseResult.success) {
      throw new Error0({
        tag: "env",
        message: `Invalid environment variables: ${z.prettifyError(parseResult.error)}`,
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

  export const zNodeEnv = z.enum(["development", "production", "test"])
  export const zHostEnv = z.enum(["local", "dev", "stage", "prod"])
  export const zString = z.string().trim().min(1)
  export const zStringOptional = z.union([
    z.literal(undefined).transform(() => undefined),
    z
      .string()
      .trim()
      .transform((val) => val || undefined),
  ])
  export const zBoolean = z.union([
    zString
      .refine(
        (val) => ["true", "false", "1", "0"].includes(val),
        `Should be: 'true' | 'false' | '1' | '0' | boolean`,
      )
      .transform((val) => val === "true" || val === "1"),
    z.boolean(),
  ])
  export const zBooleanOptional = z.union([
    z.literal("").transform(() => undefined),
    z.literal(undefined).transform(() => undefined),
    zBoolean,
  ])
  export const zNumber = z.union([
    zString
      .refine((val) => !Number.isNaN(Number(val)), "Should be a number")
      .transform(Number),
    z.number(),
  ])
  export const zNumberOptional = z.union([
    z.literal("").transform(() => undefined),
    z.literal(undefined),
    zNumber,
  ])
  export const zInt = z.union([
    zString
      .refine((val) => Number.isInteger(Number(val)), "Should be integer")
      .transform(Number),
    z.number().int(),
  ])
  export const zIntOptional = z.union([
    z.literal("").transform(() => undefined),
    z.literal(undefined),
    zInt,
  ])

  const getHelpers = (source: Record<string, unknown>) => {
    return {
      optionalOnLocalHostEnv: <T extends z.ZodTypeAny>(value: T) => {
        if (source.HOST_ENV !== "local") {
          return value
        }
        return z.union([
          z.literal(undefined),
          z.literal("").transform(() => undefined),
          value,
        ])
      },
      optionalOnNotLocalHostEnv: <T extends z.ZodTypeAny>(value: T) => {
        if (source.HOST_ENV === "local") {
          return z.literal(undefined)
        }
        return z.union([
          z.literal(undefined),
          z.literal("").transform(() => undefined),
          value,
        ])
      },
      optionalOnProdHostEnv: <T extends z.ZodTypeAny>(value: T) => {
        if (source.HOST_ENV === "prod") {
          return value
        }
        return z.union([
          z.literal(undefined),
          z.literal("").transform(() => undefined),
          value,
        ])
      },
      optionalOnNotProdHostEnv: <T extends z.ZodTypeAny>(value: T) => {
        if (source.HOST_ENV === "prod") {
          return z.literal(undefined)
        }
        return z.union([
          z.literal(undefined),
          z.literal("").transform(() => undefined),
          value,
        ])
      },
    }
  }
  type Helpers = ReturnType<typeof getHelpers>
}
