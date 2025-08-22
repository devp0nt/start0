import {
  configureSync,
  type Filter,
  getAnsiColorFormatter,
  getConsoleSink,
  getLogger,
  type Logger,
  type LogLevel,
  type LogRecord,
  type Sink,
} from "@logtape/logtape"
import { deepMap } from "@shmoject/modules/lib/deepMap"
import { Error0, type Error0Input } from "@shmoject/modules/lib/error0"
import type { ExtractEnum } from "@shmoject/modules/lib/lodash0"
import { Meta0 } from "@shmoject/modules/lib/meta0"
import debug from "debug"
import yaml from "yaml"

// TODO: add constructor props to getChild props object or category string
// TODO: hidden pretty meta keys
// TODO: disallow change meta on root logger
// TODO: remove root category from here
// TODO: create factory

export class Logger0 {
  static rootCategory = "shmoject"

  sensetiveKeys = [
    "imageUrl",
    "imagesUrls",
    "email",
    "oldEmail",
    "newEmail",
    "phone",
    "oldPhone",
    "newPhone",
    "password",
    "newPassword",
    "oldPassword",
    "token",
    "apiKey",
    "verifcationCode",
    "signature",
    "signedUrl",
    "apiSecret",
    "apiKey",
    "secret",
  ]
  hideSensitiveKeys = true

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
    sensetiveKeys,
    hideSensitiveKeys,
  }: {
    loggerOriginal: Logger
    meta?: Meta0.Meta0OrValueTypeNullish
    sensetiveKeys?: string[]
    hideSensitiveKeys?: boolean
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
    this.sensetiveKeys = sensetiveKeys || this.sensetiveKeys
    this.hideSensitiveKeys = hideSensitiveKeys || this.hideSensitiveKeys
  }

  static create = ({
    formatter,
    category,
    meta,
    sinks,
    filters,
    removeDefaultSinks,
    removeDefaultFilters,
    debugConfig,
    skipInit,
    sensetiveKeys,
    hideSensitiveKeys,
  }: {
    formatter?: Logger0.FormatterProp
    category?: string
    meta?: Meta0.Meta0OrValueTypeNullish
    sinks?: Record<string, Sink>
    filters?: Record<string, Filter>
    removeDefaultFilters?: boolean
    debugConfig?: string
    removeDefaultSinks?: boolean
    skipInit?: boolean
    sensetiveKeys?: string[]
    hideSensitiveKeys?: boolean
  }) => {
    if (!skipInit) {
      Logger0.init({
        formatter,
        sinks,
        removeDefaultSinks,
        filters,
        removeDefaultFilters,
        debugConfig,
      })
    }
    const loggerOriginal = getLogger(
      [Logger0.rootCategory, category].filter(Boolean) as string[],
    )
    return new Logger0({
      loggerOriginal,
      meta,
      sensetiveKeys,
      hideSensitiveKeys,
    })
  }

  getChild = (category: string) => {
    const loggerOriginal = this.original.getChild(category)
    return new Logger0({
      loggerOriginal,
      meta: this.meta.clone(),
      sensetiveKeys: this.sensetiveKeys,
      hideSensitiveKeys: this.hideSensitiveKeys,
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
      const metaSensetive = logger0.hideSensitiveKeys
        ? Logger0.hideSensitiveKeys({
            meta: meta.value,
            sensetiveKeys: logger0.sensetiveKeys,
          })
        : meta.value
      logger0.original[level](message, metaSensetive)
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
      const metaSensetive = logger0.hideSensitiveKeys
        ? Logger0.hideSensitiveKeys({
            meta: meta.value,
            sensetiveKeys: logger0.sensetiveKeys,
          })
        : meta.value
      const message =
        (typeof args[0] === "string" ? args[0] : meta.value.message) ||
        "Unknown message"
      logger0.original[level](message, metaSensetive)
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
    ).join(":")
  }

  private static extendCategoriesWithPropertiesTag(
    categories: readonly string[],
    properties: Record<string, unknown>,
  ) {
    return [...categories, properties.tag].filter(Boolean) as readonly string[]
  }

  static ansiColorFormatter = getAnsiColorFormatter({
    category: (category) => category.join(":"),
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

  static filterByDebug: Filter = (record) => {
    const tag = Logger0.categoriesAndPropertiesTagToTag(
      record.category,
      record.properties,
    )
    return debug.enabled(tag)
  }

  static hideSensitiveKeys = ({
    meta,
    sensetiveKeys,
  }: {
    meta: Record<string, unknown>
    sensetiveKeys: string[]
  }): Meta0.ValueType => {
    return deepMap(meta, ({ key, value }) => {
      if (sensetiveKeys.includes(key)) {
        return "*******"
      }
      return value
    })
  }

  static init = ({
    formatter = "json",
    debugConfig = `${Logger0.rootCategory}:*`,
    sinks = {},
    filters = {},
    removeDefaultSinks = false,
    removeDefaultFilters = false,
  }: {
    formatter?: Logger0.FormatterProp
    filters?: Record<string, Filter>
    sinks?: Record<string, Sink>
    debugConfig?: string
    removeDefaultSinks?: boolean
    removeDefaultFilters?: boolean
  } = {}) => {
    debug.enable(debugConfig)
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
    filters = removeDefaultFilters
      ? filters
      : {
          ...filters,
          filterByDebug: Logger0.filterByDebug,
        }
    const filtersKeys = Object.keys(filters)
    const sinksKeys = Object.keys(sinks)
    configureSync({
      reset: true,
      sinks,
      filters,
      loggers: [
        {
          category: Logger0.rootCategory,
          lowestLevel: "debug",
          sinks: sinksKeys,
          filters: filtersKeys,
        },
        {
          category: ["logtape", "meta"],
          lowestLevel: "warning",
          sinks: sinksKeys,
          filters: filtersKeys,
        },
      ],
    })
  }
}

export namespace Logger0 {
  export type FormatterPreset = "pretty" | "json"
  export type FormatterProp = FormatterPreset | ((record: LogRecord) => string)

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
