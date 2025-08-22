import {
  configure,
  getAnsiColorFormatter,
  getConsoleSink,
  getLogger,
  type Logger,
  type LogLevel,
  type LogRecord,
} from "@logtape/logtape"
import { Error0, type Error0Input } from "@shmoject/modules/lib/error0"
import type { ExtractEnum } from "@shmoject/modules/lib/lodash0"
import { Meta0 } from "@shmoject/modules/lib/meta0"
import yaml from "yaml"

// TODO: own call
// TODO: provide default meta

const ansiColorFormatter = getAnsiColorFormatter({
  category: (category) => category.join("."),
})

export class Logger0 {
  error: Logger0.LogBadFn
  fatal: Logger0.LogBadFn
  info: Logger0.LogOkFn
  warning: Logger0.LogOkFn
  trace: Logger0.LogOkFn
  debug: Logger0.LogOkFn

  original: Logger
  defaultMeta: Meta0

  private constructor({
    loggerOriginal,
    defaultMetaValue,
  }: {
    loggerOriginal: Logger
    defaultMetaValue?: Meta0.Meta0OrValueTypeNullish
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
    this.defaultMeta = Meta0.toMeta0(defaultMetaValue)
  }

  static create = async ({
    formatter,
    category,
    defaultMetaValue,
  }: {
    formatter?: Logger0.Formater
    category: string
    defaultMetaValue?: Meta0.Meta0OrValueTypeNullish
  }) => {
    await Logger0.init({ formatter })
    const loggerOriginal = getLogger(["shmoject", category])
    return new Logger0({ loggerOriginal, defaultMetaValue })
  }

  getChild = (category: string) => {
    const loggerOriginal = this.original.getChild(category)
    return new Logger0({
      loggerOriginal,
      defaultMetaValue: this.defaultMeta.clone(),
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
      const error0 =
        args[0] instanceof Error0 ? args[0] : Error0.toError0(args[0])
      const extraMeta =
        typeof args[1] === "object" && args[1] !== null
          ? Meta0.toMeta0(args[1])
          : Meta0.toMeta0({})
      const message = error0.message
      const meta = Meta0.merge(logger0.defaultMeta, error0.meta, extraMeta, {
        tag: error0.tag,
        code: error0.code,
        httpStatus: error0.httpStatus,
        expected: error0.expected,
        clientMessage: error0.clientMessage,
        stack: error0.stack,
      })
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
      const meta = Meta0.merge(logger0.defaultMeta, extraMeta)
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

  static prettyFormatter = (record: LogRecord): string => {
    const line = ansiColorFormatter({
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
    return JSON.stringify({
      timestamp: new Date(record.timestamp).toISOString(),
      level: record.level,
      message: record.message.join(", "),
      tag: Logger0.categoriesAndPropertiesTagToTag(
        record.category,
        record.properties,
      ),
      meta: Meta0.toMeta0ValueSafe(record.properties),
    })
  }

  static init = async ({
    formatter = "json",
  }: {
    formatter?: Logger0.Formater
  } = {}) => {
    const formatterHere =
      formatter === "pretty"
        ? Logger0.prettyFormatter
        : formatter === "json"
          ? Logger0.jsonFormatter
          : formatter
    await configure({
      sinks: { console: getConsoleSink({ formatter: formatterHere }) },
      loggers: [
        { category: "shmoject", lowestLevel: "debug", sinks: ["console"] },
        {
          category: ["logtape", "meta"],
          lowestLevel: "warning",
          sinks: ["console"],
        },
      ],
    })
  }
}

export namespace Logger0 {
  export type FormaterPreset = "pretty" | "json"
  export type Formater = FormaterPreset | ((record: LogRecord) => string)

  export type LogOkFn = {
    (message: string, meta?: Meta0.ValueType): void
    (message: string, meta?: Meta0): void
    (meta: Meta0.ValueType): void
    (meta: Meta0): void
  }

  export type LogBadFn = {
    (error0Input: Error0Input, meta?: Meta0.Meta0OrValueType): void
    (error0: Error0, meta?: Meta0.Meta0OrValueType): void
  }
}
// Logger0.init({ formatter: "pretty" }).then(() => {
;(async () => {
  const logger = await Logger0.create({ category: "test", formatter: "pretty" })
  logger.info("Hello, world!")
  logger.info("Hello, world!", { userId: "1" })
  const x = logger.getChild("x")
  x.info("Hello, world!")
  x.info("Hello, world!", { other: { z: 1, x: 3 } })
  const y = x.getChild("zxc.wefwef.aaa.wefgwegewg")
  y.info("Hello, world!")
  logger.error(new Error0("test0", { tag: "tag1", meta: { other: { z: 1 } } }))
  logger.error(new Error("test1"))
})()
