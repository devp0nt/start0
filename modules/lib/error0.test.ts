import { describe, expect, it } from "bun:test"
import { Error0 } from "./error0"

const fixStack = (stack: string | undefined) => {
  if (!stack) {
    return stack
  }
  // at <anonymous> (/Users/iserdmi/cc/projects/svagatron/modules/lib/error0.test.ts:103:25)
  // >>
  // at <anonymous> (...)
  const lines = stack.split("\n")
  const fixedLines = lines.map((line) => {
    const withoutPath = line.replace(/\(.*\)$/, "(...)")
    return withoutPath
  })
  return fixedLines.join("\n")
}

describe("error0", () => {
  it("simple", () => {
    const error0 = new Error0("test")
    expect(error0).toBeInstanceOf(Error0)
    expect(error0).toMatchInlineSnapshot(`[Error0: test]`)
    expect(error0.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": undefined,
        "clientMessage": undefined,
        "code": undefined,
        "expected": undefined,
        "httpStatus": undefined,
        "message": "test",
        "tag": undefined,
      }
    `)
  })

  it("full", () => {
    const input = {
      message: "my message",
      tag: "tag1",
      code: "code1",
      httpStatus: 400,
      expected: true,
      clientMessage: "human message 1",
      cause: new Error("original message"),
    }
    const error1 = new Error0(input)
    const error2 = new Error0(input.message, input)
    expect(error1.toJSON()).toMatchObject(error2.toJSON())
  })

  it("cause error default", () => {
    const errorDefault = new Error("original message")
    const error0 = new Error0("my message", { cause: errorDefault })
    expect(error0).toBeInstanceOf(Error0)
    expect(error0).toMatchInlineSnapshot(`[Error0: my message]`)
    expect(error0.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": [Error: original message],
        "clientMessage": undefined,
        "code": undefined,
        "expected": undefined,
        "httpStatus": undefined,
        "message": "my message",
        "tag": undefined,
      }
    `)
  })

  it("cause strange thing", () => {
    const error0 = new Error0("my message", { cause: "strange thing" })
    expect(error0).toMatchInlineSnapshot(`[Error0: my message]`)
    expect(error0.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": "strange thing",
        "clientMessage": undefined,
        "code": undefined,
        "expected": undefined,
        "httpStatus": undefined,
        "message": "my message",
        "tag": undefined,
      }
    `)
  })

  it("floats and overrides", () => {
    const error01 = new Error0("first", {
      tag: "tag1",
      clientMessage: "human message 1",
    })
    const error02 = new Error0("second", {
      tag: "tag2",
      code: "code2",
      cause: error01,
    })
    expect(error01).toBeInstanceOf(Error0)
    expect(error02.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": [Error0: first],
        "clientMessage": "human message 1",
        "code": "code2",
        "expected": undefined,
        "httpStatus": undefined,
        "message": "second",
        "tag": "tag2",
      }
    `)
  })

  it("keep stack trace", () => {
    const errorDefault = new Error("default error")
    const error01 = new Error0("first", {
      tag: "tag1",
      clientMessage: "human message 1",
      cause: errorDefault,
    })
    const error02 = new Error0("second", {
      tag: "tag2",
      code: "code2",
      cause: error01,
    })
    expect(fixStack(errorDefault.stack)).toMatchInlineSnapshot(`
      "Error: default error
          at <anonymous> (...)"
    `)
    expect(fixStack(error01.stack)).toMatchInlineSnapshot(`
      "Error0: first
          at <anonymous> (...)

      Error: default error
          at <anonymous> (...)"
    `)
    expect(fixStack(error02.stack)).toMatchInlineSnapshot(`
      "Error0: second
          at <anonymous> (...)

      Error0: first
          at <anonymous> (...)

      Error: default error
          at <anonymous> (...)"
    `)
  })
})
