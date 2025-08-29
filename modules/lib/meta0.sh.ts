import { deepMap } from "@shmoject/modules/lib/deepMap.sh"
import { checkEnumTypeEq } from "@shmoject/modules/lib/lodash0.sh"
import { isArray, isPlainObject } from "lodash"
import cloneDeep from "lodash/cloneDeep"
import omit from "lodash/omit.js"
import pick from "lodash/pick.js"

// TODO: simplify, remove keys definition, remove other
// TODO: on extend save parent metas in array
// TODO: getValue → function
// TODO: infer somehow correct meta in meta[] in props

export class Meta0 {
  value: Meta0.ValueType

  private static otherKeys = ["other", "tag", "tagPrefix", "service"] as const
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
  private static axiosKeys = ["axiosData", "axiosStatus"] as const
  private static zodKeys = [
    "zodTreeifyedError",
    "zodPrettifiedError",
    "zodFlattenedError",
  ] as const
  private static prismaKeys = [
    "prismaQuery",
    "prismaParams",
    "prismaDurationMs",
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
    ...Meta0.axiosKeys,
    ...Meta0.zodKeys,
    ...Meta0.prismaKeys,
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

  extend(...nexts: Meta0.Meta0OrValueTypeNullish[]) {
    return Meta0.merge(this, ...nexts)
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

  static from(input: Meta0.ValueTypeNullish): Meta0
  static from(input: Meta0.Meta0OrValueTypeNullish): Meta0
  static from(input: any) {
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
    const meta0 = Meta0.from(input)
    return meta0.isEmpty()
  }

  isEmpty(): boolean {
    return Object.keys(this.value).length === 0
  }

  private static isPrimitive(value: unknown) {
    return (
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      value === undefined ||
      value === null
    )
  }

  private static replaceNotPrimitives(value: any): Record<string, unknown> {
    return deepMap(value, ({ path, key, value }) => {
      if (isPlainObject(value) || isArray(value)) {
        return value
      }
      if (Meta0.isPrimitive(value)) {
        return value
      }
      return "__INVALID__"
    })
  }

  private static safeParseValue(input: unknown): Meta0.ValueType {
    if (typeof input !== "object" || input === null) {
      return {}
    }
    const { other, ...rest } = input as Record<string, unknown>
    const safeRest = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [
        key,
        Meta0.replaceNotPrimitives(value),
      ]),
    )
    if (typeof other !== "object" || other === null) {
      return Meta0.respectValueKeys({
        ...safeRest,
      })
    }
    const safeOther = Object.fromEntries(
      Object.entries(other).map(([key, value]) => [
        key,
        Meta0.replaceNotPrimitives(value),
      ]),
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

  fixTagPrefix({
    extend,
    replace,
  }: {
    extend?: string
    replace?: string
  }): void {
    const newBaseTagPrefix = replace || this.value.tagPrefix
    const newTagPrefix = [newBaseTagPrefix, extend].filter(Boolean).join(":")
    this.assign({
      tagPrefix: newTagPrefix,
    })
  }

  static getFinalTag(
    input: Meta0.Meta0OrValueTypeNullish,
    providedTag?: string,
  ): string | undefined {
    const meta0 = Meta0.from(input)
    return (
      [meta0.value.tagPrefix, providedTag || meta0.value.tag]
        .filter(Boolean)
        .join(":") || undefined
    )
  }

  getFinalTag(providedTag?: string): string | undefined {
    return Meta0.getFinalTag(this, providedTag)
  }

  getFinalTagParts(): string[] {
    const finalTag = this.getFinalTag()
    return finalTag ? finalTag.split(":") : []
  }

  getValueWithFinalTag(): Meta0.ValueType {
    return {
      ...omit(this.value, ["tagPrefix"]),
      tag: this.getFinalTag(),
    }
  }

  getValueWithoutTag(): Meta0.ValueType {
    return omit(this.value, ["tagPrefix", "tag"])
  }

  splitValueAndFinalTag(): {
    valueWithoutTag: Meta0.ValueType
    finalTag: string | undefined
  } {
    const valueWithoutTag = this.getValueWithoutTag()
    const finalTag = this.getFinalTag()
    return {
      valueWithoutTag,
      finalTag,
    }
  }
}

export namespace Meta0 {
  export type ValueType = {
    service?: string
    tagPrefix?: string
    tag?: string
    code?: string
    httpStatus?: number
    expected?: boolean
    clientMessage?: string
    message?: string
    userId?: string
    ideaId?: string
    other?: Record<string, unknown>
    stack?: string
    ip?: string
    userAgent?: string
    reqMethod?: string
    reqPath?: string
    reqDurationMs?: number
    trpcReqPath?: string
    trpcReqType?: string
    axiosData?: string
    axiosStatus?: number
    zodTreeifyedError?: Record<string, unknown>
    zodPrettifiedError?: string
    zodFlattenedError?: Record<string, unknown>
    prismaQuery?: string
    prismaParams?: Record<string, unknown> | string
    prismaDurationMs?: number
  }
  export type ValueTypeNullish = ValueType | undefined | null
  export type ValueTypeFlat = Omit<ValueType, "other"> & {
    [key: string]: unknown
  }
  export type ValueTypeFlatNullish = ValueTypeFlat | undefined | null
  export type Meta0OrValueType = Meta0 | Partial<ValueType>
  export type Meta0OrValueTypeNullish = Meta0OrValueType | undefined | null
  export type ValueKey = (typeof Meta0.keys)[number]
  checkEnumTypeEq<ValueKey, keyof ValueType, ValueKey>()
}
