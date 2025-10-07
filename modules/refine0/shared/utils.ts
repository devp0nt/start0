import { deepMap } from '@devp0nt/deepmap0'
import type { GlobalUISchemaOptions, UiSchema } from '@rjsf/utils'
import type { JSONSchema7Definition } from 'json-schema'
import capitalize from 'lodash/capitalize.js'
import get from 'lodash/get.js'
import set from 'lodash/set.js'
import words from 'lodash/words.js'
import type { JSONSchema } from 'zod/v4/core'

import { z } from 'zod'

export type RjsfJsonSchema = JSONSchema7Definition
export type ZodJsonSchema = JSONSchema.BaseSchema
export type JsonSchema = ZodJsonSchema | RjsfJsonSchema

export type UiSchemaSettings = {
  disableLabels?: boolean
}

// x-ui-widget = ...
// x-ui:form-widget = ...
// x-ui:view-widget = ...
export const jsonSchemaToRjsfUiSchema = ({
  js,
  scope,
  globalOptions,
}: {
  js: JsonSchema | null
  scope?: string | string[]
  globalOptions?: GlobalUISchemaOptions
}): UiSchema => {
  if (typeof js === 'boolean' || !js) {
    return jsonSchemaToRjsfUiSchema({ js: {}, scope, globalOptions })
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
      for (const oneOfScopes of scopes) {
        const scopedProps = Object.fromEntries(
          Object.entries(value)
            .filter(([key, value]) => key.startsWith(`x-ui:${oneOfScopes}-`))
            .map(([key, value]) => {
              return [key.replace(`x-ui:${oneOfScopes}-`, 'ui:'), value]
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

// x-meta-anyProperty = ...
// x-meta-anotherProperty = ...
export const jsonSchemaToMeta = (js: JsonSchema): Record<string, unknown> => {
  if (typeof js === 'boolean') {
    return jsonSchemaToMeta({})
  }
  return Object.fromEntries(Object.entries(js).filter(([key, value]) => key.startsWith('x-meta-')))
}

export function extractTitleFromJsonSchema(js: JsonSchema, key?: string): string | undefined {
  if (typeof js === 'boolean') {
    return extractTitleFromJsonSchema({}, key)
  }
  return (
    js.title ||
    words(key || '')
      .map((word) => capitalize(word))
      .join(' ') ||
    undefined
  )
}

export function getJsonSchemaProperties(js: JsonSchema | null): Record<string, Exclude<JsonSchema, boolean>> {
  if (typeof js === 'boolean' || !js?.properties) {
    return {}
  }
  return Object.fromEntries(Object.entries(js.properties).filter(([key, value]) => typeof value !== 'boolean'))
}

export function getJsonSchemaValueByPath<T = unknown>(
  js: JsonSchema | null,
  path: string,
  defaultValue: unknown = null,
): T {
  if (typeof js === 'boolean') {
    return defaultValue as T
  }
  return get(js, path, defaultValue) as T
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
