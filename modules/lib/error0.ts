import { Meta0 } from "@shmoject/modules/lib/meta0"
import { HttpStatusCode } from "axios"

// TODO: not name but isError0: true or something
// TODO: add props to meta
// TODO: trpc
// TODO: axios

export interface Error0InputGeneral {
  message?: string
  tag?: string
  code?: string
  httpStatus?: HttpStatusCode | HttpStatusCodeString
  expected?: boolean | ExpectedFn
  clientMessage?: string
  cause?: Error0Cause
  meta?: Meta0.ValueType | Meta0
}

export interface Error0Input extends Error0InputGeneral {
  maxLevel?: number
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
  public readonly tag?: Error0GeneralProps["tag"]
  public readonly code?: Error0GeneralProps["code"]
  public readonly httpStatus?: Error0GeneralProps["httpStatus"]
  public readonly expected?: Error0GeneralProps["expected"]
  public readonly clientMessage?: Error0GeneralProps["clientMessage"]
  public readonly cause?: Error0GeneralProps["cause"]
  public readonly meta?: Meta0.ValueType

  public readonly propsOriginal: Error0GeneralProps

  constructor(
    ...args:
      | [string]
      | [Error0Input]
      | [string, Error0Input]
      | [Error]
      | [Error, Error0Input]
      | [unknown]
      | [unknown, Error0Input]
  ) {
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
    const maxLevel = safeInput.maxLevel ?? Error0.defaultMaxLevel

    const providedMessage = safeInput.message
    const closestMessageRaw = Error0.getClosestPropValue<"message", unknown>(
      { message: safeInput.message, cause: safeInput.cause },
      "message",
      maxLevel,
    )
    const closestMessage =
      typeof closestMessageRaw === "string" ? closestMessageRaw : undefined
    const message = providedMessage || closestMessage || "Unknown error"
    super(message)
    Object.setPrototypeOf(this, Error0.prototype)
    this.name = "Error0"

    // Original props
    this.propsOriginal = Error0.getGeneralProps(safeInput, this.stack)

    // Self props
    const propsFloated = Error0.getPropsFloated(this.propsOriginal, maxLevel)
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
    result.maxLevel =
      typeof error0Input.maxLevel === "number"
        ? error0Input.maxLevel
        : Error0.defaultMaxLevel
    result.meta =
      typeof error0Input.meta === "object" && error0Input.meta !== null
        ? error0Input.meta
        : undefined
    return result
  }

  private static getGeneralProps(
    error0Input: Error0Input,
    stack: Error0GeneralProps["stack"],
  ): Error0GeneralProps {
    const result: Error0GeneralProps = {
      message: error0Input.message,
      tag: error0Input.tag,
      code: error0Input.code,
      httpStatus:
        typeof error0Input.httpStatus === "number"
          ? error0Input.httpStatus
          : error0Input.httpStatus &&
              typeof error0Input.httpStatus === "string" &&
              error0Input.httpStatus in HttpStatusCode
            ? HttpStatusCode[error0Input.httpStatus]
            : undefined,
      expected: undefined,
      clientMessage: error0Input.clientMessage,
      cause: error0Input.cause,
      stack: undefined,
      meta: error0Input.meta ? Meta0.toMeta0(error0Input.meta).value : {},
    }
    result.expected = Error0.normalizeExpected(result, error0Input)
    result.stack = Error0.removeConstructorStackPart(stack)
    return result
  }

  // private static getPropsArraysAll(
  //   error0Props: Error0GeneralProps,
  //   maxLevel: number,
  // ): PropsArrays {
  //   const propsArrays: PropsArrays = {
  //     messages: Error0.getAllPropValues(
  //       error0Props,
  //       "message",
  //       "messages",
  //       maxLevel,
  //     ),
  //     tags: Error0.getAllPropValues(error0Props, "tag", "tags", maxLevel),
  //     codes: Error0.getAllPropValues(error0Props, "code", "codes", maxLevel),
  //     httpStatuses: Error0.getAllPropValues(
  //       error0Props,
  //       "httpStatus",
  //       "httpStatuses",
  //       maxLevel,
  //     ),
  //     expecteds: Error0.getAllPropValues(
  //       error0Props,
  //       "expected",
  //       "expecteds",
  //       maxLevel,
  //     ),
  //     clientMessages: Error0.getAllPropValues(
  //       error0Props,
  //       "clientMessage",
  //       "clientMessages",
  //       maxLevel,
  //     ),
  //     causes: Error0.getAllPropValues(error0Props, "cause", "causes", maxLevel),
  //   }
  //   return propsArrays
  // }

  // private static getPropsArraysFilled(
  //   error0Props: Error0GeneralProps,
  //   maxLevel: number,
  // ): PropsArrays {
  //   const propsArrays: PropsArrays = {
  //     messages: Error0.getFilledPropValues(
  //       error0Props,
  //       "message",
  //       "messages",
  //       maxLevel,
  //     ),
  //     tags: Error0.getFilledPropValues(error0Props, "tag", "tags", maxLevel),
  //     codes: Error0.getFilledPropValues(error0Props, "code", "codes", maxLevel),
  //     httpStatuses: Error0.getFilledPropValues(
  //       error0Props,
  //       "httpStatus",
  //       "httpStatuses",
  //       maxLevel,
  //     ),
  //     expecteds: Error0.getFilledPropValues(
  //       error0Props,
  //       "expected",
  //       "expecteds",
  //       maxLevel,
  //     ),
  //     clientMessages: Error0.getFilledPropValues(
  //       error0Props,
  //       "clientMessage",
  //       "clientMessages",
  //       maxLevel,
  //     ),
  //     causes: Error0.getFilledPropValues(
  //       error0Props,
  //       "cause",
  //       "causes",
  //       maxLevel,
  //     ),
  //   }
  //   return propsArrays
  // }

  private static getPropsFloated(
    error0Props: Error0GeneralProps,
    maxLevel: number,
  ): Error0GeneralProps {
    const cause = Error0.getClosestPropValue(error0Props, "cause", maxLevel)
    const causeStack =
      typeof cause === "object" &&
      cause !== null &&
      "stack" in cause &&
      typeof cause.stack === "string"
        ? cause.stack
        : undefined
    const stack = Error0.mergeStack(causeStack, error0Props.stack)
    const propsFloated: Error0GeneralProps = {
      message: Error0.getClosestPropValue(error0Props, "message", maxLevel),
      tag: Error0.getClosestPropValue(error0Props, "tag", maxLevel),
      code: Error0.getClosestPropValue(error0Props, "code", maxLevel),
      httpStatus: Error0.getClosestPropValue(
        error0Props,
        "httpStatus",
        maxLevel,
      ),
      expected: Error0._isExpected(error0Props, maxLevel),
      clientMessage: Error0.getClosestPropValue(
        error0Props,
        "clientMessage",
        maxLevel,
      ),
      cause,
      stack,
      meta: Error0.getMergedMetaValue(error0Props, maxLevel),
    }
    return propsFloated
  }

  // expected

  private static normalizeExpected(
    error0Props: Error0GeneralProps,
    error0Input: Error0Input,
  ): boolean | undefined {
    if (typeof error0Input.expected === "function") {
      return error0Input.expected(error0Props)
    }
    return error0Input.expected
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
      return Error0._isExpected(causeProvided, maxLevel - 1, hasExpectedTrue)
    }

    return hasExpectedTrue
  }
  static isExpected(error: unknown): boolean {
    return Error0._isExpected(error, Error0.defaultMaxLevel, false)
  }

  // stack

  private static removeConstructorStackPart(
    stack: Error0GeneralProps["stack"],
  ): Error0GeneralProps["stack"] {
    if (!stack) {
      return stack
    }
    const lines = stack.split("\n")
    const constructorLineIndex = lines.findIndex((line) =>
      line.includes("at new Error0"),
    )
    if (constructorLineIndex === -1) {
      return stack
    }
    lines.splice(constructorLineIndex, 1)
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
    TPropKey extends keyof Error0InputGeneral,
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
        return Error0.getClosestPropValue(
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
    const metas = Error0.getFilledPropValues(
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
    TPropKey extends keyof Error0InputGeneral,
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
        ...Error0.getFilledPropValues(
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

    if (error instanceof Error) {
      return error.name === "Error0"
    }

    if (typeof error === "object" && error !== null) {
      if ("name" in error) {
        return error.name === "Error0"
      }
    }

    return false
  }

  private static _toError0(error: unknown, maxLevel: number): Error0 {
    if (error instanceof Error0) {
      return error
    }

    if (typeof error === "string") {
      return new Error0(error, { maxLevel })
    }

    if (typeof error === "object" && error !== null) {
      return new Error0({
        message:
          "message" in error && typeof error.message === "string"
            ? error.message
            : "Unknown error",
        code:
          "code" in error && typeof error.code === "string"
            ? error.code
            : undefined,
        clientMessage:
          "clientMessage" in error && typeof error.clientMessage === "string"
            ? error.clientMessage
            : undefined,
        expected:
          "expected" in error && typeof error.expected === "boolean"
            ? error.expected
            : undefined,
        tag:
          "tag" in error && typeof error.tag === "string"
            ? error.tag
            : undefined,
        cause: "cause" in error ? error.cause : undefined,
        meta: "meta" in error ? error.meta : undefined,
        maxLevel,
      })
    }

    return new Error0({
      message: "Unknown error",
    })
  }

  static toError0(error: unknown): Error0 {
    return Error0._toError0(error, Error0.defaultMaxLevel)
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
    }
  }
  static toJSON(error: unknown) {
    const error0 = Error0.toError0(error)
    return error0.toJSON()
  }
}
