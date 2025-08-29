import { deepMap } from "@shmoject/modules/lib/deepMap.sh"
import { assign, isArray, isPlainObject } from "lodash"
import cloneDeep from "lodash/cloneDeep"
import omit from "lodash/omit.js"
import pick from "lodash/pick.js"
import z from "zod"

// TODO: simplify, remove keys definition, remove other
// TODO: on extend save parent metas in array
// TODO: getValue → function
// TODO: infer somehow correct meta in meta[] in props

export class Meta0 {
  private value: Readonly<Meta0.ValueType>
  private parent: Meta0 | undefined

  static schema = z.object({
    tag: z.string().optional(),
    tagPrefix: z.string().optional(),
    code: z.string().optional(),
    message: z.string().optional(),
    httpStatus: z.number().optional(),
    expected: z.boolean().optional(),
  })

  private constructor({
    input,
    parent,
  }: { input: Meta0.ValueTypeNullish; parent?: Meta0 }) {
    this.value = input ? cloneDeep(input) : {}
    this.parent = parent
  }

  static create(input?: Meta0.ValueTypeNullish) {
    return new Meta0({ input })
  }

  isEmpty(): boolean {
    return Object.keys(this.value).length === 0
  }

  getSelfValueRaw(): Meta0.ValueType {
    return this.value
  }

  getSelfValue(): Meta0.ValueType {
    return Meta0.replaceNotPrimitives(this.value)
  }

  getParents(): Meta0[] {
    const parents: Meta0[] = []
    let currentParent = this.parent
    let level = 0
    while (currentParent && level < 100) {
      parents.unshift(currentParent)
      currentParent = currentParent.parent
      level++
    }
    return parents
  }

  getValue(): Meta0.ValueType {
    const parentsSelfValues = this.getParents().map((parent) =>
      parent.getSelfValue(),
    )
    return cloneDeep(assign({}, ...parentsSelfValues, this.value))
  }
  static getValue(input: Meta0.Meta0OrValueTypeNullish): Meta0.ValueType {
    return Meta0.from(input).getValue()
  }

  getValueRaw(): Meta0.ValueType {
    const parentsSelfValuesRaw = this.getParents().map((parent) =>
      parent.getSelfValueRaw(),
    )
    return cloneDeep(assign({}, ...parentsSelfValuesRaw, this.value))
  }
  static getValueRaw(input: Meta0.Meta0OrValueTypeNullish): Meta0.ValueType {
    return Meta0.from(input).getValueRaw()
  }

  static from(input: Meta0.Meta0OrValueTypeNullish): Meta0 {
    if (input instanceof Meta0) {
      return input
    }
    return new Meta0({ input: input })
  }

  extend(...nexts: Meta0.Meta0OrValueTypeNullish[]) {
    const values = nexts.map(Meta0.getValueRaw)
    const input = cloneDeep(assign({}, ...values))
    return new Meta0({ input, parent: this })
  }
  static extend(
    first: Meta0.Meta0OrValueTypeNullish,
    ...nexts: Meta0.Meta0OrValueTypeNullish[]
  ): Meta0 {
    return Meta0.from(first).extend(...nexts)
  }

  assign(...nexts: Meta0.Meta0OrValueTypeNullish[]): void {
    const values = nexts.map(Meta0.getValueRaw)
    assign(this.value, cloneDeep(assign({}, ...values)))
  }

  static mergeValues(
    first: Meta0.Meta0OrValueTypeNullish,
    ...nexts: Meta0.Meta0OrValueTypeNullish[]
  ): Meta0.ValueType {
    return Meta0.extend(first, ...nexts).getValue()
  }

  clone() {
    return new Meta0({ input: this.value, parent: this.parent })
  }

  getValueOmit(keys: string[]): Meta0.ValueType {
    return omit(this.getValue(), keys)
  }

  getValuePick(keys: string[]): Meta0.ValueType {
    return pick(this.getValue(), keys)
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

  private static replaceNotPrimitives(
    value: Meta0.ValueType,
  ): Record<string, unknown> {
    return deepMap(value, ({ path, key, value }) => {
      if (isPlainObject(value) || isArray(value)) {
        return value
      }
      if (Meta0.isPrimitive(value)) {
        return value
      }
      return "__NOT_PRIMITIVE__"
    })
  }

  updateTagPrefix({
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

  getFinalTag(providedTag?: string): string | undefined {
    return (
      [this.value.tagPrefix, providedTag || this.value.tag]
        .filter(Boolean)
        .join(":") || undefined
    )
  }
  static getFinalTag(
    input: Meta0.Meta0OrValueTypeNullish,
    providedTag?: string,
  ): string | undefined {
    return Meta0.from(input).getFinalTag(providedTag)
  }

  getFinalTagParts(): string[] {
    const finalTag = this.getFinalTag()
    return finalTag ? finalTag.split(":") : []
  }
}

export namespace Meta0 {
  export type KnownValueType = Partial<z.infer<typeof Meta0.schema>>
  export type KnownValueKey = keyof KnownValueType
  export type ValueType = KnownValueType & {
    [key: string]: unknown
  }
  export type ValueTypeNullish = ValueType | undefined | null
  export type Meta0OrValueType = Meta0 | ValueType
  export type Meta0OrValueTypeNullish = Meta0OrValueType | undefined | null
}
