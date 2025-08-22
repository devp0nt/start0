import {
  configureSync,
  getAnsiColorFormatter,
  getConsoleSink,
  getLogger,
  type Logger,
  type LogLevel,
  type LogRecord,
  type Sink,
} from "@logtape/logtape"
import { Error0, type Error0Input } from "@shmoject/modules/lib/error0"
import type { ExtractEnum } from "@shmoject/modules/lib/lodash0"
import { Meta0 } from "@shmoject/modules/lib/meta0"
import yaml from "yaml"

// TODO: DEBUG
// TODO: hidden pretty meta keys

// TODO: disallow change meta on root logger

export class Logger0 {
  static rootCategory = "shmoject"

  error: Logger0.LogBadFn
  fatal: Logger0.LogBadFn
  info: Logger0.LogOkFn
  warning: Logger0.LogOkFn
  trace: Logger0.LogOkFn
  debug: Logger0.LogOkFn

  original: Logger

  meta: Meta0
  replaceMeta(meta0?: Meta0.Meta0OrValueTypeNullish) {
    this.meta = Meta0.toMeta0(meta0)
  }

  private constructor({
    loggerOriginal,
    meta,
  }: {
    loggerOriginal: Logger
    meta?: Meta0.Meta0OrValueTypeNullish
  }) {
    this.original = loggerOriginal
    this.error = Logger0.createLogBadFn({ logger0: this, level: "error" })
    this.fatal = Logger0.createLogBadFn({ logger0: this, level: "fatal" })
    this.info = Logger0.createLogOkFn({ logger0: this, level: "info" })
    this.warning = Logger0.createLogOkFn({
      logger0: this,
      level: "warning",
    })
    this.trace = Logger0.createLogOkFn({
      logger0: this,
      level: "trace",
    })
    this.debug = Logger0.createLogOkFn({
      logger0: this,
      level: "debug",
    })
    this.meta = Meta0.toMeta0(meta)
  }

  static create = ({
    formatter,
    category,
    meta,
    sinks,
    removeDefaultSinks,
    skipInit,
  }: {
    formatter?: Logger0.Formater
    category?: string
    meta?: Meta0.Meta0OrValueTypeNullish
    sinks?: Record<string, Sink>
    removeDefaultSinks?: boolean
    skipInit?: boolean
  }) => {
    if (!skipInit) {
      Logger0.init({ formatter, sinks, removeDefaultSinks })
    }
    const loggerOriginal = getLogger(
      [Logger0.rootCategory, category].filter(Boolean) as string[],
    )
    return new Logger0({ loggerOriginal, meta })
  }

  getChild = (category: string) => {
    const loggerOriginal = this.original.getChild(category)
    return new Logger0({
      loggerOriginal,
      meta: this.meta.clone(),
    })
  }

  private static createLogBadFn = ({
    logger0,
    level,
  }: {
    logger0: Logger0
    level: ExtractEnum<LogLevel, "error" | "fatal">
  }) => {
    const logBadFn: Logger0.LogBadFn = (...args: unknown[]) => {
      const error0 = args[0] instanceof Error0 ? args[0] : Error0.from(args[0])
      const extraMeta =
        typeof args[1] === "object" && args[1] !== null
          ? Meta0.toMeta0(args[1])
          : Meta0.toMeta0({})
      const message = error0.message
      const meta = Meta0.merge(
        logger0.meta,
        error0.meta,
        {
          tag: error0.tag,
          code: error0.code,
          httpStatus: error0.httpStatus,
          expected: error0.expected,
          clientMessage: error0.clientMessage,
          stack: error0.stack,
        },
        extraMeta,
      )
      logger0.original[level](message, meta.value)
    }
    return logBadFn
  }

  private static createLogOkFn = ({
    logger0,
    level,
  }: {
    logger0: Logger0
    level: ExtractEnum<LogLevel, "info" | "warning" | "trace" | "debug">
  }) => {
    const logOkFn: Logger0.LogOkFn = (...args: unknown[]) => {
      const extraMeta =
        typeof args[0] !== "string"
          ? Meta0.toMeta0(args[0] as never)
          : Meta0.toMeta0(args[1] as never)
      const meta = Meta0.merge(logger0.meta, extraMeta)
      const message =
        (typeof args[0] === "string" ? args[0] : meta.value.message) ||
        "Unknown message"
      logger0.original[level](message, meta.value)
    }
    return logOkFn
  }

  private static categoriesAndPropertiesTagToTag(
    categories: readonly string[],
    properties: Record<string, unknown>,
  ) {
    return Logger0.extendCategoriesWithPropertiesTag(
      categories,
      properties,
    ).join(".")
  }

  private static extendCategoriesWithPropertiesTag(
    categories: readonly string[],
    properties: Record<string, unknown>,
  ) {
    return [...categories, properties.tag].filter(Boolean) as readonly string[]
  }

  static ansiColorFormatter = getAnsiColorFormatter({
    category: (category) => category.join("."),
  })

  static prettyFormatter = (record: LogRecord): string => {
    const line = Logger0.ansiColorFormatter({
      ...record,
      category: Logger0.extendCategoriesWithPropertiesTag(
        record.category,
        record.properties,
      ),
    })
    const yamlProperties =
      Object.keys(record.properties).length > 0
        ? yaml.stringify(record.properties) + "\n"
        : undefined
    return [line, yamlProperties].join("")
  }

  static jsonFormatter = (record: LogRecord): string => {
    const meta = Meta0.toMeta0(record.properties)
    return JSON.stringify({
      timestamp: new Date(record.timestamp).toISOString(),
      level: record.level,
      message: meta.value.message || record.message.join(", "),
      tag: Logger0.categoriesAndPropertiesTagToTag(
        record.category,
        record.properties,
      ),
      meta: meta.omitValue(["tag", "message"]),
    })
  }

  static init = ({
    formatter = "json",
    sinks = {},
    removeDefaultSinks = false,
  }: {
    formatter?: Logger0.Formater
    sinks?: Record<string, Sink>
    removeDefaultSinks?: boolean
  } = {}) => {
    const formatterHere =
      formatter === "pretty"
        ? Logger0.prettyFormatter
        : formatter === "json"
          ? Logger0.jsonFormatter
          : formatter
    sinks = removeDefaultSinks
      ? sinks
      : {
          console: getConsoleSink({ formatter: formatterHere }),
          ...sinks,
        }
    const sinksKeys = Object.keys(sinks)
    configureSync({
      reset: true,
      sinks,
      loggers: [
        {
          category: Logger0.rootCategory,
          lowestLevel: "debug",
          sinks: sinksKeys,
        },
        {
          category: ["logtape", "meta"],
          lowestLevel: "warning",
          sinks: sinksKeys,
        },
      ],
    })
  }
}

export namespace Logger0 {
  export type FormaterPreset = "pretty" | "json"
  export type Formater = FormaterPreset | ((record: LogRecord) => string)

  export type LogOkFn = {
    (message: string, meta?: Meta0): void
    (message: string, meta?: Meta0.ValueType): void
    (meta: Meta0): void
    (meta: Meta0.ValueType): void
  }

  export type LogBadFn = {
    (error0Input: Error0Input, meta?: Meta0.Meta0OrValueType): void
    (error0: Error0, meta?: Meta0.Meta0OrValueType): void
    (error0: unknown, meta?: Meta0.Meta0OrValueType): void
  }
}
