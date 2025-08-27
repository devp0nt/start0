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

export type CheckEnumEq<T extends string, U extends string> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false
export const checkEnumEq = <
  T extends string,
  U extends string,
  // biome-ignore lint/correctness/noUnusedVariables: <we use it only for type checking>
  M extends CheckEnumEq<T, U>,
>() => {}

export const getConstKeys = <T extends string>(obj: Record<T, unknown>) => {
  const keys = Object.keys(obj) as T[]
  return keys as [T, ...T[]]
}

export type ExtractEnum<T extends string, U extends T> = U
