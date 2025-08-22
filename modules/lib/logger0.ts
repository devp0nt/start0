import {
  configure,
  getAnsiColorFormatter,
  getConsoleSink,
  getLogger,
  type LogRecord,
} from "@logtape/logtape"
import { Error0 } from "@shmoject/modules/lib/error0"
import { Meta0 } from "@shmoject/modules/lib/meta0"
import yaml from "yaml"

// TODO: logger.error(error0)

export namespace Logger0 {
  const prettyFormatter = (record: LogRecord): string => {
    const line = getAnsiColorFormatter({
      category: (category) => category.join("."),
    })(record)
    const yamlProperties =
      Object.keys(record.properties).length > 0
        ? yaml.stringify(record.properties) + "\n"
        : undefined
    return [line, yamlProperties].join("")
  }

  const jsonFormatter = (record: LogRecord): string => {
    return JSON.stringify({
      timestamp: new Date(record.timestamp).toISOString(),
      level: record.level,
      message: record.message.join(", "),
      category: record.category.join("."),
      meta: Meta0.toMeta0ValueSafe(record.properties),
    })
  }

  export const init = async ({
    formatter = "json",
  }: {
    formatter?: "pretty" | "json"
  } = {}) => {
    const formatterHere =
      formatter === "pretty" ? prettyFormatter : jsonFormatter
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

// Logger0.init({ formatter: "pretty" }).then(() => {
Logger0.init({ formatter: "json" }).then(() => {
  const logger = getLogger(["shmoject"])
  logger.info("Hello, world!")
  logger.info("Hello, world!", { z: 1 })
  const x = logger.getChild("x")
  x.info("Hello, world!")
  x.info("Hello, world!", { z: 1, x: { x: { x: 3 } } })
  const y = x.getChild(["zxc", "wefwef.aaa", "wefgwegewg"])
  y.info("Hello, world!")
  logger.error(
    "zxc",
    new Error0("test", {
      tag: "123",
      meta: { userId: "1", other: { x: 1 } },
    }).toJSON().meta,
  )
})
