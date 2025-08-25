import { describe, expect, it } from "bun:test"
import { Error0 } from "@shmoject/modules/lib/error0"
import { Logger0 } from "@shmoject/modules/lib/logger0"
import { Meta0 } from "@shmoject/modules/lib/meta0"
import { omit } from "lodash"

const createLoggerAndLogs = () => {
  const logs: Record<string, any>[] = []
  Logger0.rootTagPrefix = "test"
  const logger0 = Logger0.create({
    tagPrefix: "nested",
    removeDefaultSinks: true,
    sinks: {
      variable: (record) => {
        const log = JSON.parse(Logger0.jsonFormatter(record))
        logs.unshift({
          ...omit(log, ["timestamp"]),
          meta: {
            ...omit(log.meta, ["stack"]),
          },
        })
      },
    },
  })
  return { logger0, logs }
}

describe("logger0", () => {
  it("info", () => {
    const { logger0, logs } = createLoggerAndLogs()
    logger0.info("Hello, world!")
    expect(logs[0]).toMatchInlineSnapshot(`
      {
        "level": "info",
        "message": "Hello, world!",
        "meta": {},
        "tag": "test:nested",
      }
    `)
  })

  it("error", () => {
    const { logger0, logs } = createLoggerAndLogs()
    logger0.error(new Error("my message"))
    expect(logs[0]).toMatchInlineSnapshot(`
      {
        "level": "error",
        "message": "my message",
        "meta": {
          "expected": false,
        },
        "tag": "test:nested",
      }
    `)
  })

  it("error0 instance", () => {
    const { logger0, logs } = createLoggerAndLogs()
    logger0.error(
      new Error0("my message", {
        expected: true,
        tag: "tag1",
        meta: {
          tag: "tag2",
          userId: "user1",
        },
      }),
    )
    expect(logs[0]).toMatchInlineSnapshot(`
      {
        "level": "error",
        "message": "my message",
        "meta": {
          "expected": true,
          "userId": "user1",
        },
        "tag": "test:nested:tag1",
      }
    `)
  })

  it("info meta value", () => {
    const { logger0, logs } = createLoggerAndLogs()
    logger0.info("xxx", {
      message: "my message",
      userId: "user1",
    })
    expect(logs[0]).toMatchInlineSnapshot(`
      {
        "level": "info",
        "message": "my message",
        "meta": {
          "userId": "user1",
        },
        "tag": "test:nested",
      }
    `)
  })

  it("info meta instance", () => {
    const { logger0, logs } = createLoggerAndLogs()
    const meta = new Meta0({
      message: "my message",
      userId: "user1",
    })
    logger0.info("xxx", meta)
    expect(logs[0]).toMatchInlineSnapshot(`
      {
        "level": "info",
        "message": "my message",
        "meta": {
          "userId": "user1",
        },
        "tag": "test:nested",
      }
    `)
  })

  it("default meta", () => {
    const { logger0, logs } = createLoggerAndLogs()
    logger0.meta.assign({
      userId: "user1",
    })
    logger0.info("xxx")
    expect(logs[0]).toMatchInlineSnapshot(`
      {
        "level": "info",
        "message": "xxx",
        "meta": {
          "userId": "user1",
        },
        "tag": "test:nested",
      }
    `)
    logger0.meta.assign({
      ideaId: "idea1",
    })
    logger0.info("xxx")
    expect(logs[0]).toMatchInlineSnapshot(`
      {
        "level": "info",
        "message": "xxx",
        "meta": {
          "ideaId": "idea1",
          "userId": "user1",
        },
        "tag": "test:nested",
      }
    `)
  })

  it("child logger", () => {
    const { logger0, logs } = createLoggerAndLogs()
    const childLogger = logger0.getChild("child")
    childLogger.info("xxx")
    expect(logs[0]).toMatchInlineSnapshot(`
      {
        "level": "info",
        "message": "xxx",
        "meta": {},
        "tag": "test:nested:child",
      }
    `)
  })
})
