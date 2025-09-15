import { deepMap } from '@devp0nt/deepmap0'
import type { Fs0 } from '@devp0nt/fs0'
import lodashOmit from 'lodash-es/omit.js'

export const omit = <TObject extends Record<string, unknown>, TKeys extends keyof TObject>(
  obj: TObject,
  keys: TKeys[],
): Omit<TObject, TKeys> => {
  return lodashOmit(obj, keys)
}

export const replacePlaceholdersAndPathsDeep = <TObject extends Record<string, unknown>>(
  obj: TObject,
  placeholders: Record<string, string>,
  fs0: Fs0,
): TObject => {
  const result = deepMap(obj, ({ value }) => {
    if (typeof value === 'string') {
      let fixed = value.replace(/{{(\w+)}}/g, (match, p1) => placeholders[p1] || match)
      if (fixed.startsWith('~/')) {
        fixed = fs0.toRel(fixed)
      }
      return fixed
    }
    return value
  })
  Object.assign(obj, result)
  return obj
}

export const fixSlahes = (path: string) => path.replace(/\/+/g, '/')
