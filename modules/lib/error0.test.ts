import { describe, expect, it } from "bun:test"
import { Error0 } from "./error0"

// TODO: test expected

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
        "expected": false,
        "httpStatus": undefined,
        "message": "test",
        "meta": {},
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
      meta: {
        reqDurationMs: 1,
        userId: "user1",
      },
    }
    const error1 = new Error0(input)
    const error2 = new Error0(input.message, input)
    expect(error1.toJSON()).toMatchObject(error2.toJSON())
    expect(error1.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": [Error: original message],
        "clientMessage": "human message 1",
        "code": "code1",
        "expected": true,
        "httpStatus": 400,
        "message": "my message",
        "meta": {
          "reqDurationMs": 1,
          "userId": "user1",
        },
        "tag": "tag1",
      }
    `)
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
        "expected": false,
        "httpStatus": undefined,
        "message": "my message",
        "meta": {},
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
        "expected": false,
        "httpStatus": undefined,
        "message": "my message",
        "meta": {},
        "tag": undefined,
      }
    `)
  })

  it("floats and overrides", () => {
    const error01 = new Error0("first", {
      tag: "tag1",
      clientMessage: "human message 1",
      meta: {
        reqDurationMs: 1,
        userId: "user1",
      },
    })
    const error02 = new Error0("second", {
      tag: "tag2",
      code: "code2",
      cause: error01,
      meta: {
        reqDurationMs: 1,
        ideaId: "idea1",
        other: {
          x: 1,
        },
      },
    })
    expect(error01).toBeInstanceOf(Error0)
    expect(error02.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": [Error0: first],
        "clientMessage": "human message 1",
        "code": "code2",
        "expected": false,
        "httpStatus": undefined,
        "message": "second",
        "meta": {
          "reqDurationMs": 1,
          "ideaId": "idea1",
          "other": {
            "x": 1,
          },
          "userId": "user1",
        },
        "tag": "tag2",
      }
    `)
  })

  it("unknown error", () => {
    const error0 = new Error0({})
    expect(error0.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": undefined,
        "clientMessage": undefined,
        "code": undefined,
        "expected": false,
        "httpStatus": undefined,
        "message": "Unknown error",
        "meta": {},
        "tag": undefined,
      }
    `)
    const error1 = new Error0("test")
    expect(error1.message).toBe("test")
    const error2 = new Error0({ cause: error1 })
    expect(error2.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": [Error0: test],
        "clientMessage": undefined,
        "code": undefined,
        "expected": false,
        "httpStatus": undefined,
        "message": "test",
        "meta": {
          "other": undefined,
        },
        "tag": undefined,
      }
    `)
    expect(fixStack(error2.stack)).toMatchInlineSnapshot(`
      "Error0: test
          at <anonymous> (...)

      Error0: test
          at <anonymous> (...)"
    `)
  })

  it("input error default", () => {
    const errorDefault = new Error("default error")
    const error0 = new Error0(errorDefault)
    expect(error0.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": [Error: default error],
        "clientMessage": undefined,
        "code": undefined,
        "expected": false,
        "httpStatus": undefined,
        "message": "default error",
        "meta": {},
        "tag": undefined,
      }
    `)
    expect(fixStack(error0.stack)).toMatchInlineSnapshot(`
      "Error0: default error
          at <anonymous> (...)

      Error: default error
          at <anonymous> (...)"
    `)
  })

  it("input error0 itself", () => {
    const error = new Error0("error0 error")
    const error0 = new Error0(error)
    expect(error0.toJSON()).toMatchInlineSnapshot(`
      {
        "cause": [Error0: error0 error],
        "clientMessage": undefined,
        "code": undefined,
        "expected": false,
        "httpStatus": undefined,
        "message": "error0 error",
        "meta": {
          "other": undefined,
        },
        "tag": undefined,
      }
    `)
    expect(fixStack(error0.stack)).toMatchInlineSnapshot(`
      "Error0: error0 error
          at <anonymous> (...)

      Error0: error0 error
          at <anonymous> (...)"
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

  it("expected", () => {
    const error0 = new Error0({
      expected: true,
    })
    expect(error0.expected).toBe(true)

    const error1 = new Error0({
      expected: false,
    })
    expect(error1.expected).toBe(false)

    const error3 = new Error0({
      expected: true,
      cause: error0,
    })
    expect(error3.expected).toBe(true)

    const error4 = new Error0({
      expected: false,
      cause: error0,
    })
    expect(error4.expected).toBe(false)

    const error5 = new Error0({
      expected: true,
      cause: error1,
    })
    expect(error5.expected).toBe(false)

    const error6 = new Error0({
      expected: false,
      cause: error1,
    })
    expect(error6.expected).toBe(false)
  })
})
