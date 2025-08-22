import { checkEnumEq } from "@shmoject/modules/lib/lodash0"
import cloneDeep from "lodash/cloneDeep"
import omit from "lodash/omit.js"
import pick from "lodash/pick.js"

// TODO: use zod to define types
// TODO: sensetive keys
// TODO: private more main then static

// TODO: infer somehow correct meta in meta[] in props

export class Meta0 {
  value: Meta0.ValueType

  private static otherKeys = ["other", "tag"] as const
  private static honoKeys = [
    "ip",
    "userAgent",
    "reqMethod",
    "reqPath",
    "reqDurationMs",
  ] as const
  private static trpcKeys = [
    "trpcReqPath",
    "trpcReqType",
    "reqDurationMs",
  ] as const
  private static errorKeys = [
    "message",
    "code",
    "tag",
    "httpStatus",
    "expected",
    "clientMessage",
    "stack",
    "message",
    "other",
  ] as const
  private static idsKeys = ["userId", "ideaId"] as const
  static keys = [
    ...Meta0.otherKeys,
    ...Meta0.trpcKeys,
    ...Meta0.honoKeys,
    ...Meta0.errorKeys,
    ...Meta0.idsKeys,
  ]

  constructor(input: Partial<Meta0.ValueType>) {
    this.value = cloneDeep(Meta0.safeParseValue(input))
  }

  static create(input: Partial<Meta0.ValueType> = {}) {
    return new Meta0(input || {})
  }

  private static mergeValuesDirty(
    first: Meta0.ValueType,
    ...nexts: Meta0.ValueType[]
  ): Meta0.ValueType {
    const all = [first, ...nexts]
    const lastTwo = all.slice(-2)
    if (lastTwo.length === 1) {
      return lastTwo[0]
    }
    const prev = lastTwo[0]
    const next = lastTwo[1]
    const other =
      !prev.other && !next.other
        ? undefined
        : {
            ...prev.other,
            ...next.other,
          }
    const allExceptLastTwo = all.slice(0, -2) as [
      Meta0.ValueType,
      ...Meta0.ValueType[],
    ]
    return Meta0.mergeValuesDirty(...allExceptLastTwo, {
      ...prev,
      ...next,
      ...(other && Object.keys(other).length > 0 ? { other } : {}),
    })
  }

  static mergeValues(
    first: Meta0.Meta0OrValueTypeNullish,
    ...nexts: Meta0.Meta0OrValueTypeNullish[]
  ) {
    return cloneDeep(
      Meta0.mergeValuesDirty(
        Meta0.toValueSafe(first),
        ...Meta0.toValuesSafe(nexts),
      ),
    )
  }

  static merge(
    first: Meta0.Meta0OrValueTypeNullish,
    ...nexts: Meta0.Meta0OrValueTypeNullish[]
  ) {
    return new Meta0(
      Meta0.mergeValuesDirty(
        Meta0.toValueSafe(first),
        ...Meta0.toValuesSafe(nexts),
      ),
    )
  }

  private static assignValues(
    first: Meta0.ValueType,
    ...nexts: Meta0.ValueType[]
  ): void {
    const all = [first, ...nexts]
    const lastTwo = all.slice(-2)
    if (lastTwo.length === 1) {
      return
    }
    const prev = lastTwo[0]
    const next = lastTwo[1]
    const { other: nextOther, ...nextRest } = next
    Object.assign(prev, nextRest)
    if (nextOther && Object.keys(nextOther).length > 0) {
      if (!prev.other) {
        prev.other = {}
      }
      Object.assign(prev.other, nextOther)
    }
    const allExceptLast = all.slice(0, -1) as [
      Meta0.ValueType,
      ...Meta0.ValueType[],
    ]
    Meta0.assignValues(...allExceptLast)
  }

  static assign(
    first: Meta0.Meta0OrValueType,
    ...nexts: Meta0.Meta0OrValueTypeNullish[]
  ): void {
    const values = [Meta0.toValueRaw(first), ...nexts.map(Meta0.toValueSafe)]
    Meta0.assignValues(values[0], ...values.slice(1))
  }

  assign(...nexts: Meta0.Meta0OrValueTypeNullish[]): void {
    Meta0.assign(this, ...nexts)
  }

  assignFlat(...nexts: Meta0.ValueTypeFlat[]): void {
    Meta0.assign(this, ...nexts)
  }

  assignDirty(...nexts: { [key: string]: unknown }[]): void {
    Meta0.assign(this, ...nexts)
  }

  clone() {
    return new Meta0(this.value)
  }

  omitValue(keys: Meta0.ValueKey[]): Meta0.ValueType {
    return cloneDeep(omit(this.value, keys))
  }

  pickValue(keys: Meta0.ValueKey[]): Meta0.ValueType {
    return cloneDeep(pick(this.value, keys))
  }

  static toMeta0(input: Meta0.ValueTypeNullish): Meta0
  static toMeta0(input: Meta0.Meta0OrValueTypeNullish): Meta0
  static toMeta0(input: any) {
    if (input instanceof Meta0) {
      return input
    }
    return new Meta0(input || {})
  }

  static toValueRaw(input: Meta0.Meta0OrValueTypeNullish): Meta0.ValueType {
    if (input instanceof Meta0) {
      return input.value
    }
    return input || {}
  }

  static toValuesRaw(
    input: Meta0.Meta0OrValueTypeNullish[],
  ): Meta0.ValueType[] {
    return input.map(Meta0.toValueRaw)
  }

  static toValueSafe(input: Meta0.Meta0OrValueTypeNullish): Meta0.ValueType {
    return Meta0.safeParseValue(Meta0.toValueRaw(input))
  }

  static toValuesSafe(
    input: Meta0.Meta0OrValueTypeNullish[],
  ): Meta0.ValueType[] {
    return input.map(Meta0.toValueSafe)
  }

  static isEmpty(input: Meta0.Meta0OrValueTypeNullish): boolean {
    const meta0 = Meta0.toMeta0(input)
    return meta0.isEmpty()
  }

  isEmpty(): boolean {
    return Object.keys(this.value).length === 0
  }

  private static isPrimitive(value: unknown): value is Meta0.Primitive {
    return (
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      value === undefined ||
      value === null
    )
  }

  private static safeParseValue(input: unknown): Meta0.ValueType {
    if (typeof input !== "object" || input === null) {
      return {}
    }
    const { other, ...rest } = input as Record<string, unknown>
    const safeRest = Object.fromEntries(
      Object.entries(rest).map(([key, value]) =>
        Meta0.isPrimitive(value) ? [key, value] : [key, "__INVALID__"],
      ),
    )
    if (typeof other !== "object" || other === null) {
      return Meta0.respectValueKeys({
        ...safeRest,
      })
    }
    const safeOther = Object.fromEntries(
      Object.entries(other).map(([key, value]) =>
        Meta0.isPrimitive(value) ? [key, value] : [key, "__INVALID__"],
      ),
    )
    return Meta0.respectValueKeys({
      ...safeRest,
      ...(Object.keys(safeOther).length > 0 ? { other: safeOther } : {}),
    })
  }

  private static respectValueKeys<T>(
    meta0Value: Meta0.ValueType,
    allowedKeys: T[] = Meta0.keys as T[],
  ): Meta0.ValueType {
    const result: Meta0.ValueType = {}
    for (const [key, value] of Object.entries(meta0Value)) {
      if (allowedKeys.includes(key as T)) {
        if (key === "other") {
          if (typeof value === "object" && value !== null) {
            result.other = {
              ...result.other,
              ...value,
            }
          }
        } else {
          ;(result as any)[key] = value
        }
      } else {
        ;(result.other as any) = {
          ...result.other,
          [key]: value,
        }
      }
    }
    return result
  }
}

export namespace Meta0 {
  export type Primitive = number | string | boolean | undefined | null
  export type ValueType = {
    tag?: string
    code?: string
    httpStatus?: number
    expected?: boolean
    clientMessage?: string
    message?: string
    userId?: string
    ideaId?: string
    other?: Record<string, Primitive>
    stack?: string
    ip?: string
    userAgent?: string
    reqMethod?: string
    reqPath?: string
    reqDurationMs?: number
    trpcReqPath?: string
    trpcReqType?: string
  }
  export type ValueTypeNullish = ValueType | undefined | null
  export type ValueTypeFlat = Omit<ValueType, "other"> & {
    [key: string]: Primitive
  }
  export type ValueTypeFlatNullish = ValueTypeFlat | undefined | null
  export type Meta0OrValueType = Meta0 | Partial<ValueType>
  export type Meta0OrValueTypeNullish = Meta0OrValueType | undefined | null
  export type ValueKey = (typeof Meta0.keys)[number]
  checkEnumEq<keyof ValueType, ValueKey, true>()
}
