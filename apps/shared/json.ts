import _, { get } from 'lodash'
import z from 'zod'
import type { JSONSchema } from 'zod/v4/core'

export type JsonSchema = JSONSchema.BaseSchema
export type _JsonSchema = JSONSchema._JSONSchema

export function zodToJsonSchema(schema: z.ZodType, options: Parameters<typeof z.toJSONSchema>[1] = {}): JsonSchema {
  return z.toJSONSchema(schema, {
    unrepresentable: 'any',
    ...options,
    override: (ctx) => {
      // const def = (ctx.zodSchema as unknown as z.ZodType).def;
      const def = ctx.zodSchema._zod.def

      // plain z.date()
      if (def.type === 'date') {
        ctx.jsonSchema.type = 'string'
        ctx.jsonSchema.format = 'date-time'
      }

      if (ctx.jsonSchema.type === 'object') {
        ctx.jsonSchema.properties = Object.fromEntries(
          Object.entries(ctx.jsonSchema.properties || {}).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return [key, value]
            }
            return [key, { ...value, title: extractTitleFromJsonSchema(value, key) }]
          }),
        )
      }

      // let user-supplied override run too
      if (options.override) {
        options.override(ctx)
      }
    },
  })
}

export function withJsonSchemaAsMeta<TZodSchema extends z.ZodType>(schema: TZodSchema): TZodSchema {
  return schema.meta(zodToJsonSchema(schema))
}

export function extractTitleFromJsonSchema(js: _JsonSchema, defaultValue: string): string {
  if (typeof js === 'boolean') {
    return extractTitleFromJsonSchema({}, defaultValue)
  }
  return (
    js.title ||
    _.words(defaultValue)
      .map((word) => _.capitalize(word))
      .join(' ') ||
    'Untitled'
  )
}

// export function applyTitlesToJsonSchema(js: _JsonSchema, propKey?: string): JsonSchema {
//   if (typeof js === 'boolean') {
//     return applyTitlesToJsonSchema({})
//   }
//   const result: JsonSchema = { ...js }
//   if (propKey || js.title) {
//     result.title = extractTitleFromJsonSchema(js, propKey || '')
//   }
//   result.properties &&= Object.fromEntries(
//     Object.entries(result.properties).map(([key, value]) => [key, applyTitlesToJsonSchema(value, key)]),
//   )
//   return result
// }

export const extractWidgetNameFromJsonSchema = (
  js: _JsonSchema | undefined,
  type: 'form' | 'view' | 'preview',
): string | undefined => {
  if (typeof js === 'boolean' || !js) {
    return extractWidgetNameFromJsonSchema({}, type)
  }
  const xWidget = (() => {
    if (type === 'form') {
      return get(js, ['x-form-widget'])
    }
    if (type === 'view') {
      return get(js, ['x-view-widget']) || get(js, ['x-preview-widget'])
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (type === 'preview') {
      return get(js, ['x-preview-widget']) || get(js, ['x-view-widget'])
    }
    return undefined
  })()
  if (!xWidget || typeof xWidget !== 'string') {
    return undefined
  }
  return xWidget
}
