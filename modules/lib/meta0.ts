import { checkEnumEq } from "@shmoject/modules/lib/lodash0"
import cloneDeep from "lodash/cloneDeep"

// TODO: if some keys not in place, then move them to other

export class Meta0 {
  value: Meta0.ValueType

  private static generalKeys = [
    "durationMs",
    "tag",
    "code",
    "httpStatus",
    "expected",
    "clientMessage",
    "message",
    "other",
  ] as const
  private static idsKeys = ["userId", "ideaId"] as const
  static keys = [...Meta0.generalKeys, ...Meta0.idsKeys]

  constructor(input: Partial<Meta0.ValueType>) {
    this.value = cloneDeep(input)
  }

  static create(input: Partial<Meta0.ValueType>) {
    return new Meta0(input)
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
      other,
    })
  }

  static mergeValues(
    first: Meta0.Meta0OrValueType,
    ...nexts: Meta0.Meta0OrValueType[]
  ) {
    return cloneDeep(
      Meta0.mergeValuesDirty(
        Meta0.toMeta0Value(first),
        ...Meta0.toMeta0Values(nexts),
      ),
    )
  }

  static merge(
    first: Meta0.Meta0OrValueType,
    ...nexts: Meta0.Meta0OrValueType[]
  ) {
    return new Meta0(
      Meta0.mergeValuesDirty(
        Meta0.toMeta0Value(first),
        ...Meta0.toMeta0Values(nexts),
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
    Object.assign(first, {
      ...nextRest,
    })
    if (nextOther) {
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
    prev: Meta0 | Partial<Meta0.ValueType>,
    next: Meta0 | Partial<Meta0.ValueType>,
  ): void {
    const nextValue = next instanceof Meta0 ? next.value : next
    if (prev instanceof Meta0) {
      Meta0.assignValues(prev.value, nextValue)
    } else {
      Meta0.assignValues(prev, nextValue)
    }
  }

  assign(next: Meta0 | Partial<Meta0.ValueType>): void {
    Meta0.assign(this, next)
  }

  static toMeta0(input: Meta0.Meta0OrValueType): Meta0 {
    if (input instanceof Meta0) {
      return input
    }
    return new Meta0(input)
  }

  static toMeta0Value(input: Meta0.Meta0OrValueType): Meta0.ValueType {
    if (input instanceof Meta0) {
      return input.value
    }
    return input
  }

  static toMeta0Values(input: Meta0.Meta0OrValueType[]): Meta0.ValueType[] {
    return input.map(Meta0.toMeta0Value)
  }
}

export namespace Meta0 {
  export type ValueType = {
    durationMs?: number
    tag?: string
    code?: string
    httpStatus?: number
    expected?: boolean
    clientMessage?: string
    message?: string
    userId?: string
    ideaId?: string
    other?: Record<string, number | string | boolean | undefined | null>
  }
  export type Meta0OrValueType = Meta0 | Partial<ValueType>
  checkEnumEq<keyof ValueType, (typeof Meta0.keys)[number], true>()
}
