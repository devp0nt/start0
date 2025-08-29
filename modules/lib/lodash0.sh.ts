import lodashOmit from "lodash/omit.js"
import lodashPick from "lodash/pick.js"

export const pick = <TObject extends Object, TKeys extends keyof TObject>(
  obj: TObject,
  keys: TKeys[],
): Pick<TObject, TKeys> => {
  return lodashPick(obj, keys)
}

export const omit = <
  TObject extends Record<string, unknown>,
  TKeys extends keyof TObject,
>(
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

export const checkEnumTypeEq = <
  T extends string,
  U extends T,
  // biome-ignore lint/correctness/noUnusedVariables: <x>
  M extends U,
>() => {}

export const getConstKeys = <T extends string>(obj: Record<T, unknown>) => {
  const keys = Object.keys(obj) as T[]
  return keys as [T, ...T[]]
}

export type ExtractEnum<T extends string, U extends T> = U

export type NonFnProps<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}
export type NonFnPropsKeys<T> = NonFnProps<T>[keyof NonFnProps<T>]
export type FnProps<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}
export type FnPropsKeys<T> = FnProps<T>[keyof FnProps<T>]
