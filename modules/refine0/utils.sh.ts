import _, { get } from 'lodash'
import type { JSONSchema } from 'zod/v4/core'

export type JsonSchema = JSONSchema.BaseSchema
export type _JsonSchema = JSONSchema._JSONSchema

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
