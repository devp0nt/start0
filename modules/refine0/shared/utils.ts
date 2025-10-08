import { deepMap } from '@devp0nt/deepmap0'
import type { GlobalUISchemaOptions, UiSchema } from '@rjsf/utils'
import deepmerge from 'deepmerge'
import type { JSONSchema7Definition } from 'json-schema'
import capitalize from 'lodash/capitalize.js'
import get from 'lodash/get.js'
import set from 'lodash/set.js'
import words from 'lodash/words.js'
import simpleEval from 'simple-eval'
import type { JSONSchema } from 'zod/v4/core'

import { z } from 'zod'

export type RjsfJsonSchema = JSONSchema7Definition
export type ZodJsonSchema = JSONSchema.BaseSchema
export type JsonSchema = ZodJsonSchema | RjsfJsonSchema

let defaultZodToJsOptions: ZodToJsOptions = {
  datify: true,
  titlify: true,
  nullablify: true,
}

export const setDefaultZodToJsOptions = (options: ZodToJsOptions) => {
  defaultZodToJsOptions = options
}

export const getDefaultZodToJsOptions = (): ZodToJsOptions => {
  return defaultZodToJsOptions
}

export type ZodToJsOptions = {
  datify?: boolean
  titlify?: boolean
  nullablify?: boolean
} & Parameters<typeof z.toJSONSchema>[1]
export function zodToJs(zSchema: z.ZodType, options: ZodToJsOptions = {}): ZodJsonSchema {
  const { datify, titlify, ...restOptions } = {
    ...defaultZodToJsOptions,
    ...options,
  }
  return z.toJSONSchema(zSchema, {
    unrepresentable: 'any',
    ...restOptions,
    override: (ctx) => {
      // const def = (ctx.zodSchema as unknown as z.ZodType).def;
      const def = ctx.zodSchema._zod.def

      if (datify) {
        if (def.type === 'date') {
          ctx.jsonSchema.type = 'string'
          ctx.jsonSchema.format = 'date-time'
        }
      }

      if (ctx.jsonSchema.type === 'object' && titlify) {
        ctx.jsonSchema.properties = Object.fromEntries(
          Object.entries(ctx.jsonSchema.properties || {}).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return [key, value]
            }
            return [key, { ...value, title: value.title === '' ? '' : extractTitleFromJs(value, key) }]
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

let defaultExtractTitleFromJsOverrides: Record<string, string> = {
  Sn: 'SN',
  Id: 'ID',
}
export const setDefaultExtractTitleFromJsOverrides = (overrides: Record<string, string>) => {
  defaultExtractTitleFromJsOverrides = overrides
}
export const getDefaultExtractTitleFromJsOverrides = (): Record<string, string> => {
  return defaultExtractTitleFromJsOverrides
}

// x-ui-widget = ...
// x-ui:form-widget = ...
// x-ui:view-widget = ...
export const jsToRjsfUiSchema = ({
  js,
  scope,
  globalOptions,
}: {
  js: JsonSchema | null
  scope?: string | string[]
  globalOptions?: GlobalUISchemaOptions
}): UiSchema => {
  if (typeof js === 'boolean' || !js) {
    return jsToRjsfUiSchema({ js: {}, scope, globalOptions })
  }
  const result: UiSchema = {}
  deepMap(js, ({ value, path }) => {
    if (typeof value === 'object' && value !== null) {
      const fixedPath = path.replaceAll('.properties.', '.').replaceAll('properties.', '')
      const props = Object.fromEntries(
        Object.entries(value)
          .filter(([key, value]) => key.startsWith('x-ui-'))
          .map(([key, value]) => {
            return [key.replace('x-ui-', 'ui:'), value]
          }),
      )
      const scopes = !scope ? [] : Array.isArray(scope) ? scope : [scope]
      for (const scopeItem of scopes) {
        const scopedProps = Object.fromEntries(
          Object.entries(value)
            .filter(([key, value]) => key.startsWith(`x-ui:${scopeItem}-`))
            .map(([key, value]) => {
              return [key.replace(`x-ui:${scopeItem}-`, 'ui:'), value]
            }),
        )
        // TODO if ui options is object merge it
        Object.assign(props, scopedProps)
      }
      const uiOptions: Record<string, unknown> = {}
      Object.entries(props)
        .filter(([key, value]) => key.startsWith('ui:options-'))
        .forEach(([key, value]) => {
          const optionsKey = key.replace('ui:options-', '')
          uiOptions[optionsKey] = value
        })
      if (Object.keys(uiOptions).length > 0) {
        set(props, 'ui:options', uiOptions)
      }
      const uiGlobalOptions: Record<string, unknown> = {}
      Object.entries(props)
        .filter(([key, value]) => key.startsWith('ui:globalOptions-'))
        .forEach(([key, value]) => {
          const optionsKey = key.replace('ui:globalOptions-', '')
          uiGlobalOptions[optionsKey] = value
        })
      if (Object.keys(uiGlobalOptions).length > 0) {
        set(props, 'ui:globalOptions', uiGlobalOptions)
      }
      if (Object.keys(props).length > 0) {
        set(result, fixedPath, props)
      }
    }
    return value
  })
  if (Object.keys(globalOptions || {}).length > 0) {
    set(result, 'ui:globalOptions', { ...(result['ui:globalOptions'] || {}), ...globalOptions })
  }
  return result
}

export const overrideRjsfUiSchema = (uiSchema: UiSchema | undefined | null, overrides: UiSchema): UiSchema => {
  return deepmerge(uiSchema || {}, overrides)
}

export const disableRjsfUiSchemaLabel = (uiSchema: UiSchema | undefined | null): UiSchema => {
  return overrideRjsfUiSchema(uiSchema, { 'ui:options': { label: false } })
}

export const evaluate = <T = unknown>(expression: string, data: unknown = {}): T => {
  try {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Data is not an object')
    }
    return simpleEval(expression, data as Record<string, unknown>) as T
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to evaluate expression "${expression}":`, err)
    return undefined as T
  }
}

export const evalifyJsByData = (js: JsonSchema | null, data: unknown): JsonSchema | null => {
  if (!js || typeof js === 'boolean') {
    return null
  }
  return deepMap(js, ({ value }) => {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      return evaluate(value.slice(2, -2), data)
    }
    return value
  })
}

export const toRjsfJs = (js: JsonSchema | null): Exclude<RjsfJsonSchema, boolean> | null => {
  if (!js || typeof js === 'boolean') {
    return null
  }
  return js as Exclude<RjsfJsonSchema, boolean>
}

// x-refine-resource-meta-anyProperty = ...
// x-refine-resource-meta-anotherProperty = ...
export const jsToRefineResourceMeta = (js: JsonSchema): Record<string, unknown> => {
  if (typeof js === 'boolean') {
    return jsToRefineResourceMeta({})
  }
  return Object.fromEntries(
    Object.entries(js)
      .filter(([key, value]) => key.startsWith('x-refine-resource-meta-'))
      .map(([key, value]) => {
        return [key.replace('x-refine-resource-meta-', ''), value]
      }),
  )
}

export function extractTitleFromJs(
  js: JsonSchema,
  key?: string,
  overrides: Record<string, string> = {},
): string | undefined {
  if (typeof js === 'boolean') {
    return extractTitleFromJs({}, key)
  }
  const result =
    js.title ||
    words(key || '')
      .map((word) => capitalize(word))
      .join(' ') ||
    undefined
  if (!result) {
    return result
  }
  const combinedOverrides = { ...getDefaultExtractTitleFromJsOverrides(), ...overrides }
  return result
    .split(' ')
    .map((word) => combinedOverrides[word] || word)
    .join(' ')
}

export function getJsProperties(js: JsonSchema | null): Record<string, Exclude<JsonSchema, boolean>> {
  if (typeof js === 'boolean' || !js?.properties) {
    return {}
  }
  return Object.fromEntries(Object.entries(js.properties).filter(([key, value]) => typeof value !== 'boolean'))
}

export function getJsValueByPath<T = unknown>(js: JsonSchema | null, path: string, defaultValue: unknown = null): T {
  if (typeof js === 'boolean') {
    return defaultValue as T
  }
  return get(js, path, defaultValue) as T
}

export function removeAdditionalDataByJs<T>(js: JsonSchema | null, data: T): T {
  if (!js || typeof js === 'boolean' || typeof data !== 'object' || data === null) {
    return data
  }
  if (js.type === 'object' && js.properties) {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
      const propSchema = get(js, `properties.${key}`)
      // keep only declared properties
      if (propSchema) {
        result[key] = removeAdditionalDataByJs(propSchema, get(data, key))
      } else if (js.additionalProperties !== false) {
        // if additionalProperties not forbidden — keep it
        result[key] = get(data, key)
      }
    }
    return result as T
  }
  if (js.type === 'array' && js.items && Array.isArray(data)) {
    return data.map((item) => removeAdditionalDataByJs(js.items as JsonSchema | null, item)) as unknown as T
  }
  return data
}

export function nullablifyJs(schema: JsonSchema | null): JsonSchema | null {
  if (!schema || typeof schema !== 'object') return schema
  // Handle oneOf / anyOf => type: ['x','null']
  const fix = (arrKey: 'oneOf' | 'anyOf') => {
    const arr = schema[arrKey]
    if (Array.isArray(arr) && arr.length === 2) {
      const types = arr.map((x) => (x && typeof x === 'object' && 'type' in x ? x.type : undefined)).filter(Boolean)
      if (types.includes('null') && types.length === 2) {
        schema.type = types as never
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete schema[arrKey]
      }
    }
  }
  fix('oneOf')
  fix('anyOf')
  // Recurse into nested schemas
  if (schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      const propSchema = get(schema, `properties.${key}`)
      if (propSchema) {
        set(schema, `properties.${key}`, nullablifyJs(propSchema))
      }
    }
  }
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      schema.items = schema.items.map((item) => nullablifyJs(item)) as never
    } else {
      schema.items = nullablifyJs(schema.items) as never
    }
  }
  return schema
}

/** Operators */
const logicalOperatorEnum = z.enum([
  'eq',
  'ne',
  'lt',
  'gt',
  'lte',
  'gte',
  'in',
  'nin',
  'ina',
  'nina',
  'contains',
  'ncontains',
  'containss',
  'ncontainss',
  'between',
  'nbetween',
  'null',
  'nnull',
  'startswith',
  'nstartswith',
  'startswiths',
  'nstartswiths',
  'endswith',
  'nendswith',
  'endswiths',
  'nendswiths',
] as const)

const conditionalOperatorEnum = z.enum(['or', 'and'] as const)

/** CrudFilter (recursive) */
const zFilter: z.ZodType<any> = z.lazy(() =>
  z.union([
    // LogicalFilter
    z.object({
      field: z.string(),
      operator: logicalOperatorEnum,
      value: z.any(),
    }),
    // ConditionalFilter
    z.object({
      key: z.string().optional(),
      operator: conditionalOperatorEnum,
      value: z.array(z.lazy(() => zFilter)),
    }),
  ]),
)

/** CrudFilters */
export const zFilters = z.array(zFilter)

/** CrudSort */
const zSort = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']),
})

/** CrudSorting */
export const zSorters = z.array(zSort)

// (optional) Inferred types
export type CrudFilter = z.infer<typeof zFilter>
export type CrudFilters = z.infer<typeof zFilters>
export type CrudSort = z.infer<typeof zSort>
export type CrudSorting = z.infer<typeof zSorters>
