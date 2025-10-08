/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import lodashOmit from 'lodash/omit.js'
import lodashPick from 'lodash/pick.js'
import type * as z from 'zod'

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

export function parseZod<T extends z.ZodType>(zSchema: T, data: z.input<T>): z.infer<T>
export function parseZod<T extends z.ZodType>(zSchema: T, data: Array<z.input<T>>): Array<z.infer<T>>
export function parseZod<T extends z.ZodType>(
  zSchema: T,
  data: Array<z.input<T>> | z.input<T>,
): Array<z.infer<T>> | z.infer<T> {
  if (Array.isArray(data)) {
    return zSchema.array().parse(data)
  }
  return zSchema.parse(data)
}

export function parseZodOrNull<T extends z.ZodType, D extends z.input<T> | null>(
  zSchema: T,
  data: D,
): D extends null ? null : z.infer<T>
export function parseZodOrNull<T extends z.ZodType, D extends Array<z.input<T>> | null[]>(
  zSchema: T,
  data: D,
): D extends null[] ? null[] : Array<z.infer<T>>
export function parseZodOrNull<T extends z.ZodType, D extends Array<z.input<T>> | z.input<T> | null | null[]>(
  zSchema: T,
  data: D,
) {
  if (data === null) {
    return null
  }
  if (Array.isArray(data)) {
    if (data.every((item) => item === null)) {
      return data.map(() => null)
    } else {
      return zSchema.array().parse(data)
    }
  } else {
    return zSchema.parse(data)
  }
}
