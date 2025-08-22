import { Meta0 } from "@shmoject/modules/lib/meta0"
import { TRPCClientError } from "@trpc/client"
import { HttpStatusCode } from "axios"
import { get, pick } from "lodash"

// TODO: causes

// TODO: createLoader with error0
// TODO: anyMessage
// TODO: optional erro stack on root.tsx
// TODO: trpc
// TODO: zod
// TODO: private more main then static
// TODO: axios

// TODO: restart frontend server on code change

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

    super(safeInput.message || Error0.defaultMessage)
    Object.setPrototypeOf(this, (this.constructor as typeof Error0).prototype)
    this.name = "Error0"

    this.propsOriginal = (
      this.constructor as typeof Error0
    ).getSelfGeneralProps(safeInput, safeInput.stack || this.stack)
    const causesProps = (this.constructor as typeof Error0).getCausesProps(
      this.propsOriginal,
      (this.constructor as typeof Error0).defaultMaxLevel,
    )
    const propsFloated = (
      this.constructor as typeof Error0
    ).getSelfPropsFloated(causesProps)
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

  private static getSelfGeneralProps(
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
    result.expected = this.normalizeSelfExpected(
      result,
      typeof error0Input.expected === "boolean" ||
        typeof error0Input.expected === "function"
        ? error0Input.expected
        : meta.expected || this.defaultExpected,
    )
    result.stack = this.removeConstructorStackPart(stack)
    return result
  }

  private static getSelfPropsFloated(
    causesProps: Error0GeneralProps[],
  ): Error0GeneralProps {
    const cause = this.getClosestPropValue(causesProps, "cause")
    const stack = this.mergeStack(causesProps[1]?.stack, causesProps[0]?.stack)
    const propsFloated: Error0GeneralProps = {
      message: this.getClosestPropValue(causesProps, "message"),
      tag: this.getClosestPropValue(causesProps, "tag"),
      code: this.getClosestPropValue(causesProps, "code"),
      httpStatus: this.getClosestPropValue(causesProps, "httpStatus"),
      expected: this.isExpected(causesProps),
      clientMessage: this.getClosestPropValue(causesProps, "clientMessage"),
      cause,
      stack,
      meta: this.getMergedMetaValue(causesProps),
    }
    return propsFloated
  }

  // expected

  private static normalizeSelfExpected(
    error0Props: Error0GeneralProps,
    expectedProvided: Error0Input["expected"],
  ): boolean | undefined {
    if (typeof expectedProvided === "function") {
      return expectedProvided(error0Props)
    }
    return expectedProvided
  }

  private static isExpected(causesProps: Error0GeneralProps[]): boolean {
    let hasExpectedTrue = false
    for (const causeProps of causesProps) {
      if (causeProps.expected === false) {
        return false
      }
      if (causeProps.expected === true) {
        hasExpectedTrue = true
      }
    }
    return hasExpectedTrue
  }

  // getters

  private static getPropsFromUnknown(
    error: unknown,
    override?: Error0Input,
  ): Error0GeneralProps {
    if (typeof error !== "object" || error === null) {
      return {
        message: undefined,
        tag: undefined,
        code: undefined,
        httpStatus: undefined,
        expected: undefined,
        clientMessage: undefined,
        cause: undefined,
        stack: undefined,
        meta: {},
      }
    }
    const result: Error0GeneralProps = {
      message:
        "message" in error && typeof error.message === "string"
          ? error.message
          : override?.message || undefined,
      code:
        "code" in error && typeof error.code === "string"
          ? error.code
          : override?.code || undefined,
      clientMessage:
        "clientMessage" in error && typeof error.clientMessage === "string"
          ? error.clientMessage
          : override?.clientMessage || undefined,
      expected: undefined,
      stack:
        "stack" in error && typeof error.stack === "string"
          ? error.stack
          : undefined,
      tag:
        "tag" in error && typeof error.tag === "string"
          ? error.tag
          : override?.tag || undefined,
      cause: "cause" in error ? error.cause : override?.cause || undefined,
      meta:
        "meta" in error && typeof error.meta === "object" && error.meta !== null
          ? Meta0.toMeta0ValueSafe(error.meta)
          : Meta0.toMeta0ValueSafe(override?.meta) || {},
      httpStatus:
        "httpStatus" in error &&
        typeof error.httpStatus === "number" &&
        error.httpStatus in HttpStatusCode
          ? error.httpStatus
          : typeof override?.httpStatus === "string"
            ? HttpStatusCode[override.httpStatus]
            : override?.httpStatus,
    }
    result.expected = this.normalizeSelfExpected(
      result,
      "expected" in error &&
        (typeof error.expected === "boolean" ||
          typeof error.expected === "function")
        ? (error.expected as ExpectedFn)
        : override?.expected || undefined,
    )
    return result
  }

  private static getCausesProps(
    error0OrProps: unknown,
    maxLevel: number,
  ): Error0GeneralProps[] {
    const error0Props =
      error0OrProps instanceof Error0
        ? error0OrProps.propsOriginal
        : error0OrProps
    const causesProps: Error0GeneralProps[] = []
    causesProps.push(this.getPropsFromUnknown(error0OrProps))
    if (
      typeof error0Props !== "object" ||
      error0Props === null ||
      !("cause" in error0Props) ||
      !error0Props.cause
    ) {
      return causesProps
    }
    if (maxLevel > 0) {
      causesProps.push(...this.getCausesProps(error0Props.cause, maxLevel - 1))
    }
    return causesProps
  }

  private static getClosestPropValue<TPropKey extends keyof Error0GeneralProps>(
    causesProps: Error0GeneralProps[],
    propKey: TPropKey,
  ): NonNullable<Error0GeneralProps[TPropKey]> | undefined {
    for (const causeProps of causesProps) {
      const propValue = causeProps[propKey]
      if (isFilled(propValue)) {
        return propValue as NonNullable<Error0GeneralProps[TPropKey]>
      }
    }
    return undefined
  }

  private static getFilledPropValues<TPropKey extends keyof Error0Input>(
    causesProps: Error0GeneralProps[],
    propKey: TPropKey,
  ): NonNullable<Error0GeneralProps[TPropKey]>[] {
    const values: NonNullable<Error0GeneralProps[TPropKey]>[] = []
    for (const causeProps of causesProps) {
      const propValue = causeProps[propKey]
      if (isFilled(propValue)) {
        values.push(propValue as NonNullable<Error0GeneralProps[TPropKey]>)
      }
    }
    return values
  }

  private static getMergedMetaValue(
    causesProps: Error0GeneralProps[],
  ): Meta0.ValueType {
    const metas = this.getFilledPropValues(causesProps, "meta")
    if (metas.length === 0) {
      return {}
    } else if (metas.length === 1) {
      return metas[0]
    } else {
      return Meta0.mergeValues(metas[0], ...metas.slice(1))
    }
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

    if (error instanceof TRPCClientError) {
      const error0Json = get(error, "data.error0")
      return this._toError0(error0Json)
    }

    // if (
    //   typeof error === "object" &&
    //   error !== null &&
    //   "message" in error &&
    //   typeof error.message === "string" &&
    //   error.message.includes("__I_AM_ERROR_0")
    // ) {
    //   try {
    //     const error0Json = JSON.parse(error.message)
    //     return this._toError0(error0Json)
    //   } catch {}
    // }

    if (typeof error === "string") {
      return new Error0(error)
    }

    if (typeof error === "object" && error !== null) {
      const input = this.getPropsFromUnknown(
        error,
        inputOverride,
      ) satisfies Error0Input
      if (this.isLikelyError0(error)) {
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

export namespace Error0 {
  export type JSON = ReturnType<Error0["toJSON"]>
}

export const ErrorExpected0 = Error0.extendClass({
  defaultExpected: true,
})
