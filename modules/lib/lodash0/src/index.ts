/* eslint-disable eslint-comments/require-description -- ok */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import lodashOmit from 'lodash/omit.js'
import lodashPick from 'lodash/pick.js'

export const pick = <TObject extends object, TKeys extends keyof TObject>(
  obj: TObject,
  keys: TKeys[],
): Pick<TObject, TKeys> => {
  return lodashPick(obj, keys)
}

export const omit = <TObject extends Record<string, unknown>, TKeys extends keyof TObject>(
  obj: TObject,
  keys: TKeys[],
): Omit<TObject, TKeys> => {
  return lodashOmit(obj, keys)
}

export const keys = <T extends string>(obj: Record<T, unknown>) => {
  return Object.keys(obj) as T[]
}

export const constKeys = <T extends string>(obj: Record<T, unknown>) => {
  const keys = Object.keys(obj) as T[]
  return keys as [T, ...T[]]
}

export const checkEnumTypeEq = <T extends string, U extends T, M extends U>() => {}

export const getConstKeys = <T extends string>(obj: Record<T, unknown>) => {
  const keys = Object.keys(obj) as T[]
  return keys as [T, ...T[]]
}
