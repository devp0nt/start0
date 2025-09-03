import { Error0, type Error0Input } from "@ideanick/modules/lib/error0.sh"
import type { ExtractEnum } from "@ideanick/modules/lib/lodash0.sh"
import { Meta0 } from "@ideanick/modules/lib/meta0.sh"
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
import debug from "debug"
import { omit } from "lodash"
import yaml from "yaml"

// TODO: oneliner formatter

export class Logger0 {
  static rootTagPrefix = "ideanick"

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
    this.meta = Meta0.from(meta0)
  }

  constructor({
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
    this.meta = Meta0.from(meta)
    this.sensetiveKeys = sensetiveKeys || this.sensetiveKeys
    this.hideSensitiveKeys = hideSensitiveKeys || this.hideSensitiveKeys
  }

  static create = ({
    formatter,
    meta: metaProvided,
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
    const meta = Meta0.from(metaProvided)
    const loggerOriginal = getLogger([Logger0.rootTagPrefix, ...meta.getFinalTagParts()].filter(Boolean) as string[])
    return new Logger0({
      loggerOriginal,
      meta,
      sensetiveKeys,
      hideSensitiveKeys,
    })
  }

  extend = (
    input:
      | string // extendTagPrefix
      | {
          replaceTagPrefix?: string
          extendTagPrefix?: string
          extendMeta?: Meta0.Meta0OrValueTypeNullish
          replaceMeta?: Meta0.Meta0OrValueTypeNullish
        },
  ) => {
    const { replaceTagPrefix, extendTagPrefix, extendMeta, replaceMeta } = (() => {
      if (typeof input === "string") {
        return {
          extendTagPrefix: input,
        }
      } else {
        return input
      }
    })()
    const newMeta = replaceMeta ? Meta0.from(replaceMeta) : this.meta.clone()
    if (extendMeta) {
      newMeta.assign(extendMeta)
    }
    if (replaceTagPrefix) {
      newMeta.updateTagPrefix({
        replace: replaceTagPrefix,
      })
    }
    if (extendTagPrefix) {
      newMeta.updateTagPrefix({
        extend: extendTagPrefix,
      })
    }

    return new Logger0({
      loggerOriginal: this.original,
      meta: newMeta,
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
        typeof args[1] === "object" && args[1] !== null ? Meta0.from(args[1] as Meta0.ValueType) : Meta0.from({})
      const message = error0.message
      const meta = Meta0.extend(
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
      const metaWithHiddenSensetive = logger0.hideSensitiveKeys
        ? Logger0.hideSensitiveKeys({
            meta: meta.getValue(),
            sensetiveKeys: logger0.sensetiveKeys,
          })
        : meta.getValue()
      logger0.original[level](message, metaWithHiddenSensetive)
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
      const extraMeta = typeof args[0] !== "string" ? Meta0.from(args[0] as never) : Meta0.from(args[1] as never)
      const meta = Meta0.extend(logger0.meta, extraMeta)
      const metaWithHiddenSensetive = logger0.hideSensitiveKeys
        ? Logger0.hideSensitiveKeys({
            meta: meta.getValue(),
            sensetiveKeys: logger0.sensetiveKeys,
          })
        : meta.getValue()
      const message = (typeof args[0] === "string" ? args[0] : meta.getValue().message) || "Unknown message"
      logger0.original[level](message, metaWithHiddenSensetive)
    }
    return logOkFn
  }

  private static logRecordToTag(record: LogRecord, withRootTagPrefix: boolean) {
    const finalTagByProperties = Meta0.getFinalTag(record.properties)
    return (
      [withRootTagPrefix ? this.rootTagPrefix : null, finalTagByProperties].filter(Boolean).join(":") || "unknownTag"
    )
  }

  static ansiColorFormatter = getAnsiColorFormatter({})

  static prettyFormatter = (record: LogRecord): string => {
    const line = Logger0.ansiColorFormatter({
      ...record,
      category: [Logger0.logRecordToTag(record, false)],
    })
    const visibleProperties = omit(record.properties, ["tag", "tagPrefix", "message"])
    const yamlProperties =
      Object.keys(visibleProperties).length > 0 ? yaml.stringify(visibleProperties) + "\n" : undefined
    return [line, yamlProperties].join("")
  }

  static jsonFormatter = (record: LogRecord): string => {
    const meta = Meta0.getValue(record.properties)
    return JSON.stringify({
      timestamp: new Date(record.timestamp).toISOString(),
      level: record.level,
      message: meta.message || record.message.join(", "),
      tag: Logger0.logRecordToTag(record, true),
      meta: omit(meta, ["tag", "tagPrefix", "message"]),
    })
  }

  static filterByDebug: Filter = (record) => {
    const tag = Logger0.logRecordToTag(record, true)
    return debug.enabled(tag)
  }

  static hideSensitiveKeys = ({
    meta,
    sensetiveKeys,
  }: {
    meta: Record<string, unknown>
    sensetiveKeys: string[]
  }): Meta0.ValueType => {
    return Meta0.from(meta).getValueWithDeepReplacedValues(sensetiveKeys)
  }

  static init = ({
    formatter = "json",
    debugConfig = `${Logger0.rootTagPrefix}:*`,
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
      formatter === "pretty" ? Logger0.prettyFormatter : formatter === "json" ? Logger0.jsonFormatter : formatter
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
          category: Logger0.rootTagPrefix,
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
