import { Meta0 } from "@shmoject/modules/lib/meta0"
import { TRPCClientError } from "@trpc/client"
import { HttpStatusCode } from "axios"
import { get, pick } from "lodash"

// TODO: anyMessage
// TODO: optional erro stack on root.tsx
// TODO: trpc
// TODO: zod
// TODO: private more main then static
// TODO: axios

// TODO: fix default message in extended error0, should be used in constuctor of Error0

export interface Error0Input {
  message?: string
  tag?: string
  code?: string
  httpStatus?: HttpStatusCode | HttpStatusCodeString
  expected?: boolean | ExpectedFn
  clientMessage?: string
  cause?: Error0Cause
  stack?: string
  meta?: Meta0.Meta0OrValueTypeNullish
}

interface Error0GeneralProps {
  message: Error0Input["message"]
  tag: Error0Input["tag"]
  code: Error0Input["code"]
  httpStatus: number | undefined
  expected: boolean | undefined
  clientMessage: Error0Input["clientMessage"]
  cause: Error0Input["cause"]
  stack: Error["stack"]
  meta: Meta0.ValueType
}

type HttpStatusCodeString = keyof typeof HttpStatusCode
type Error0Cause = Error | Error0 | unknown
type ExpectedFn = (error: Error0GeneralProps) => boolean | undefined

const isFilled = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined && value !== ""

export class Error0 extends Error {
  public readonly __I_AM_ERROR_0: true = true

  public readonly tag?: Error0GeneralProps["tag"]
  public readonly code?: Error0GeneralProps["code"]
  public readonly httpStatus?: Error0GeneralProps["httpStatus"]
  public readonly expected?: Error0GeneralProps["expected"]
  public readonly clientMessage?: Error0GeneralProps["clientMessage"]
  public readonly cause?: Error0GeneralProps["cause"]
  public readonly meta?: Meta0.ValueType

  static defaultMessage = "Unknown error"
  static defaultTag?: Error0GeneralProps["tag"]
  static defaultCode?: Error0GeneralProps["code"]
  static defaultHttpStatus?: Error0GeneralProps["httpStatus"]
  static defaultExpected?: Error0GeneralProps["expected"]
  static defaultClientMessage?: Error0GeneralProps["clientMessage"]
  static defaultCause?: Error0GeneralProps["cause"]
  static defaultMeta?: Meta0.ValueType

  public readonly propsOriginal: Error0GeneralProps

  constructor(message: string)
  constructor(input: Error0Input)
  constructor(message: string, input: Error0Input)
  constructor(error: Error)
  constructor(error: Error, input: Error0Input)
  constructor(value: unknown)
  constructor(value: unknown, input: Error0Input)
  constructor(...args: unknown[]) {
    const input: Partial<Error0Input> = {}
    if (args[0] instanceof Error) {
      input.cause = args[0]
    } else if (typeof args[0] === "object" && args[0] !== null) {
      Object.assign(input, args[0])
    } else if (typeof args[0] === "string") {
      input.message = args[0]
    }
    if (typeof args[1] === "object" && args[1] !== null) {
      Object.assign(input, args[1])
    }
    const safeInput = Error0.safeParseInput(input)

    const providedMessage = safeInput.message
    const closestMessageRaw = Error0.getClosestPropValue<"message", unknown>(
      { message: safeInput.message, cause: safeInput.cause },
      "message",
      Error0.defaultMaxLevel,
    )
    const closestMessage =
      typeof closestMessageRaw === "string" ? closestMessageRaw : undefined
    const message = providedMessage || closestMessage || Error0.defaultMessage
    super(message)
    Object.setPrototypeOf(this, (this.constructor as typeof Error0).prototype)
    this.name = "Error0"

    // Original props
    this.propsOriginal = (this.constructor as typeof Error0).getGeneralProps(
      safeInput,
      safeInput.stack || this.stack,
    )

    // Self props
    const propsFloated = (this.constructor as typeof Error0).getPropsFloated(
      this.propsOriginal,
      (this.constructor as typeof Error0).defaultMaxLevel,
    )
    this.tag = propsFloated.tag
    this.code = propsFloated.code
    this.httpStatus = propsFloated.httpStatus
    this.expected = propsFloated.expected
    this.clientMessage = propsFloated.clientMessage
    this.cause = propsFloated.cause
    this.stack = propsFloated.stack
    this.meta = propsFloated.meta
  }

  // settings

  static defaultMaxLevel = 10

  // props

  private static safeParseInput(
    error0Input: Record<string, unknown>,
  ): Error0Input {
    const result: Error0Input = {}
    result.message =
      typeof error0Input.message === "string" ? error0Input.message : undefined
    result.tag =
      typeof error0Input.tag === "string" ? error0Input.tag : undefined
    result.code =
      typeof error0Input.code === "string" ? error0Input.code : undefined
    result.httpStatus =
      typeof error0Input.httpStatus === "number" ||
      typeof error0Input.httpStatus === "string"
        ? (error0Input.httpStatus as never)
        : undefined
    result.expected =
      typeof error0Input.expected === "function" ||
      typeof error0Input.expected === "boolean"
        ? (error0Input.expected as never)
        : undefined
    result.clientMessage =
      typeof error0Input.clientMessage === "string"
        ? error0Input.clientMessage
        : undefined
    result.cause = error0Input.cause
    result.stack =
      typeof error0Input.stack === "string" ? error0Input.stack : undefined
    // result.meta0 =
    //   error0Input.meta0 instanceof Meta0 ? error0Input.meta0 : undefined
    // result.meta =
    //   typeof error0Input.meta === "object" && error0Input.meta !== null
    //     ? error0Input.meta
    //     : undefined
    result.meta =
      error0Input.meta instanceof Meta0
        ? error0Input.meta
        : typeof error0Input.meta === "object" && error0Input.meta !== null
          ? error0Input.meta
          : undefined
    return result
  }

  private static getGeneralProps(
    error0Input: Error0Input,
    stack: Error0GeneralProps["stack"],
  ): Error0GeneralProps {
    // const meta = Meta0.merge(error0Input.meta0, error0Input.meta).value
    const meta = Meta0.merge(
      this.defaultMeta,
      error0Input.meta,
      error0Input.meta,
    ).value
    const result: Error0GeneralProps = {
      message: error0Input.message || this.defaultMessage,
      tag: error0Input.tag || meta.tag || this.defaultTag,
      code: error0Input.code || meta.code || this.defaultCode,
      httpStatus:
        typeof error0Input.httpStatus === "number"
          ? error0Input.httpStatus
          : error0Input.httpStatus &&
              typeof error0Input.httpStatus === "string" &&
              error0Input.httpStatus in HttpStatusCode
            ? HttpStatusCode[error0Input.httpStatus]
            : meta.httpStatus || this.defaultHttpStatus,
      expected: undefined,
      clientMessage: error0Input.clientMessage || this.defaultClientMessage,
      cause: error0Input.cause || this.defaultCause,
      stack: undefined,
      meta,
    }
    result.expected = this.normalizeExpected(
      result,
      typeof error0Input.expected === "boolean" ||
        typeof error0Input.expected === "function"
        ? error0Input.expected
        : meta.expected || this.defaultExpected,
    )
    result.stack = this.removeConstructorStackPart(stack)
    return result
  }

  private static getPropsFloated(
    error0Props: Error0GeneralProps,
    maxLevel: number,
  ): Error0GeneralProps {
    const cause = this.getClosestPropValue(error0Props, "cause", maxLevel)
    const causeStack =
      typeof cause === "object" &&
      cause !== null &&
      "stack" in cause &&
      typeof cause.stack === "string"
        ? cause.stack
        : undefined
    const stack = this.mergeStack(causeStack, error0Props.stack)
    const propsFloated: Error0GeneralProps = {
      message: this.getClosestPropValue(error0Props, "message", maxLevel),
      tag: this.getClosestPropValue(error0Props, "tag", maxLevel),
      code: this.getClosestPropValue(error0Props, "code", maxLevel),
      httpStatus: this.getClosestPropValue(error0Props, "httpStatus", maxLevel),
      expected: this._isExpected(error0Props, maxLevel),
      clientMessage: this.getClosestPropValue(
        error0Props,
        "clientMessage",
        maxLevel,
      ),
      cause,
      stack,
      meta: this.getMergedMetaValue(error0Props, maxLevel),
    }
    return propsFloated
  }

  // expected

  private static normalizeExpected(
    error0Props: Error0GeneralProps,
    expectedProvided: Error0Input["expected"],
  ): boolean | undefined {
    if (typeof expectedProvided === "function") {
      return expectedProvided(error0Props)
    }
    return expectedProvided
  }

  private static _isExpected(
    error0OrProps: unknown,
    maxLevel: number,
    hasExpectedTrue: boolean = false,
  ): boolean {
    const expectedProvided =
      typeof error0OrProps === "object" &&
      error0OrProps !== null &&
      "expected" in error0OrProps &&
      typeof error0OrProps.expected === "boolean"
        ? error0OrProps.expected
        : undefined
    const causeProvided =
      typeof error0OrProps === "object" &&
      error0OrProps !== null &&
      "cause" in error0OrProps &&
      error0OrProps.cause !== null
        ? error0OrProps.cause
        : undefined

    if (typeof expectedProvided === "boolean") {
      if (expectedProvided === false) {
        return false
      } else {
        hasExpectedTrue = true
      }
    }

    if (
      typeof causeProvided === "object" &&
      causeProvided !== null &&
      maxLevel > 0
    ) {
      return this._isExpected(causeProvided, maxLevel - 1, hasExpectedTrue)
    }

    return hasExpectedTrue
  }
  static isExpected(error: unknown): boolean {
    return this._isExpected(error, this.defaultMaxLevel, false)
  }

  // stack

  private static removeConstructorStackPart(
    stack: Error0GeneralProps["stack"],
  ): Error0GeneralProps["stack"] {
    if (!stack) {
      return stack
    }
    const lines = stack.split("\n")
    const removeLineContains = (search: string) => {
      const lineIndex = lines.findIndex((line) => line.includes(search))
      if (lineIndex === -1) {
        return lineIndex
      }
      lines.splice(lineIndex, 1)
      return lineIndex
    }
    removeLineContains("at new Error0")
    removeLineContains("at _toError0")
    removeLineContains("at Error0.from")
    removeLineContains("at Error0._toError0")
    removeLineContains("at new ExtendedError0")
    return lines.join("\n")
  }

  private static mergeStack(
    prevStack: Error0GeneralProps["stack"],
    nextStack: Error0GeneralProps["stack"],
  ): Error0GeneralProps["stack"] {
    return [nextStack, prevStack].filter(Boolean).join("\n\n") || undefined
  }

  // getters

  private static getClosestPropValue<
    TPropKey extends keyof Error0GeneralProps,
    TPropValueNormalized,
  >(
    error0OrProps: unknown,
    propKey: TPropKey,
    maxLevel: number,
    getter: (props: unknown) => TPropValueNormalized = (props) =>
      (typeof props === "object" && props !== null && propKey in props
        ? props[propKey as keyof typeof props]
        : undefined) as TPropValueNormalized,
  ): NonNullable<TPropValueNormalized> | undefined {
    const error0Props =
      error0OrProps instanceof Error0
        ? error0OrProps.propsOriginal
        : error0OrProps
    const propValue = getter(error0Props)
    if (isFilled(propValue)) {
      return propValue
    }
    if (
      typeof error0Props !== "object" ||
      error0Props === null ||
      !("cause" in error0Props) ||
      !error0Props.cause
    ) {
      return undefined
    }
    if (maxLevel > 0) {
      if (error0Props.cause instanceof Error0) {
        return error0Props.cause[propKey] as
          | NonNullable<TPropValueNormalized>
          | undefined
      } else {
        return this.getClosestPropValue(
          error0Props.cause,
          propKey,
          maxLevel - 1,
          getter,
        )
      }
    }
    return undefined
  }

  private static getMergedMetaValue(
    error0OrProps: unknown,
    maxLevel: number,
  ): Meta0.ValueType {
    const metas = this.getFilledPropValues(
      error0OrProps,
      "meta",
      maxLevel,
      (props) =>
        typeof props === "object" && props !== null && "meta" in props
          ? props.meta
          : undefined,
    )
    if (metas.length === 0) {
      return {}
    } else if (metas.length === 1) {
      return metas[0]
    } else {
      return Meta0.mergeValues(metas[0], ...metas.slice(1))
    }
  }

  private static getFilledPropValues<
    TPropKey extends keyof Error0Input,
    TPropValueNormalized,
  >(
    error0OrProps: unknown,
    propKey: TPropKey,
    maxLevel: number,
    getter: (props: unknown) => TPropValueNormalized = (props) =>
      (typeof props === "object" && props !== null && propKey in props
        ? props[propKey as keyof typeof props]
        : undefined) as TPropValueNormalized,
  ): NonNullable<TPropValueNormalized>[] {
    const values: NonNullable<TPropValueNormalized>[] = []
    const error0Props: unknown =
      error0OrProps instanceof Error0
        ? error0OrProps.propsOriginal
        : error0OrProps
    if (typeof error0Props !== "object" || error0Props === null) {
      return values
    }
    const propValue = getter(error0Props)
    if (isFilled(propValue)) {
      values.push(propValue)
    }
    if (
      typeof error0Props !== "object" ||
      error0Props === null ||
      !("cause" in error0Props) ||
      !error0Props.cause
    ) {
      return values
    }
    if (maxLevel > 0) {
      values.push(
        ...this.getFilledPropValues(
          error0Props.cause,
          propKey,
          maxLevel - 1,
          getter,
        ),
      )
    }
    return values
  }

  // transformations

  static isError0(error: unknown): error is Error0 {
    return error instanceof Error0
  }

  static isLikelyError0(error: unknown): error is Error0 {
    if (error instanceof Error0) {
      return true
    }

    if (typeof error === "object" && error !== null) {
      if ("name" in error && error.name === "Error0") {
        return true
      }

      if ("__I_AM_ERROR_0" in error && error.__I_AM_ERROR_0 === true) {
        return true
      }
    }

    return false
  }

  private static _toError0(
    error: unknown,
    inputOverride?: Error0Input,
  ): Error0 {
    if (error instanceof Error0) {
      return error
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("__I_AM_ERROR_0")
    ) {
      try {
        const error0Json = JSON.parse(error.message)
        return this._toError0(error0Json)
      } catch {}
    }

    if (typeof error === "string") {
      return new Error0(error)
    }

    if (typeof error === "object" && error !== null) {
      const input = {
        message:
          "message" in error && typeof error.message === "string"
            ? error.message
            : inputOverride?.message || undefined,
        code:
          "code" in error && typeof error.code === "string"
            ? error.code
            : inputOverride?.code || undefined,
        clientMessage:
          "clientMessage" in error && typeof error.clientMessage === "string"
            ? error.clientMessage
            : inputOverride?.clientMessage || undefined,
        expected:
          "expected" in error && typeof error.expected === "boolean"
            ? error.expected
            : inputOverride?.expected || undefined,
        tag:
          "tag" in error && typeof error.tag === "string"
            ? error.tag
            : inputOverride?.tag || undefined,
        cause:
          "cause" in error ? error.cause : inputOverride?.cause || undefined,
        meta:
          "meta" in error &&
          typeof error.meta === "object" &&
          error.meta !== null
            ? error.meta
            : inputOverride?.meta || undefined,
        httpStatus:
          "httpStatus" in error &&
          typeof error.httpStatus === "number" &&
          error.httpStatus in HttpStatusCode
            ? error.httpStatus
            : inputOverride?.httpStatus || undefined,
      } satisfies Error0Input

      if (this.isLikelyError0(input)) {
        return new Error0(input)
      } else {
        return new Error0(
          pick(input, ["message", "code", "httpStatus", "stack"]),
        )
      }
    }

    return new Error0({
      message: this.defaultMessage,
    })
  }

  static from(error: unknown, inputOverride?: Error0Input): Error0 {
    return this._toError0(error, inputOverride)
  }

  static extendClass(props: {
    defaultMessage?: Error0GeneralProps["message"]
    defaultTag?: Error0GeneralProps["tag"]
    defaultCode?: Error0GeneralProps["code"]
    defaultHttpStatus?: Error0GeneralProps["httpStatus"]
    defaultExpected?: Error0GeneralProps["expected"]
    defaultClientMessage?: Error0GeneralProps["clientMessage"]
    defaultCause?: Error0GeneralProps["cause"]
    defaultMeta?: Meta0.ValueType
  }) {
    return class ExtendedError0 extends Error0 {
      static defaultMessage = props.defaultMessage || Error0.defaultMessage
      static defaultTag = props.defaultTag
      static defaultCode = props.defaultCode
      static defaultHttpStatus = props.defaultHttpStatus
      static defaultExpected = props.defaultExpected
      static defaultClientMessage = props.defaultClientMessage
      static defaultCause = props.defaultCause
      static defaultMeta = props.defaultMeta
    }
  }

  toJSON() {
    return {
      message: this.message,
      tag: this.tag,
      code: this.code,
      httpStatus: this.httpStatus,
      expected: this.expected,
      clientMessage: this.clientMessage,
      cause: this.cause,
      meta: this.meta,
      stack: this.stack,
      __I_AM_ERROR_0: this.__I_AM_ERROR_0,
    }
  }
  static toJSON(error: unknown, inputOverride?: Error0Input) {
    const error0 = this.from(error, inputOverride)
    return error0.toJSON()
  }
}

// export class ErrorExpected0 extends Error0 {
//   static self = ErrorExpected0
//   self = ErrorExpected0
//   static defaultExpected = true

//   constructor(...args: unknown[]) {
//     super("...")
//     Object.setPrototypeOf(this, new.target.prototype) // ✅ correct subclass
//   }
// }

export const ErrorExpected0 = Error0.extendClass({
  defaultExpected: true,
})
