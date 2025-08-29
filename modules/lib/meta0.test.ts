import { describe, expect, it } from "bun:test"
import { Meta0 } from "@shmoject/modules/lib/meta0.sh"

describe("meta0", () => {
  it("simple", () => {
    const meta0 = Meta0.create()
    expect(meta0).toBeInstanceOf(Meta0)
    expect(meta0.getValue()).toMatchInlineSnapshot(`{}`)
  })

  it("full", () => {
    const meta0 = Meta0.create({
      reqDurationMs: 1,
      userId: "user1",
      ideaId: "idea1",
      other: {
        x: 1,
      },
    })
    expect(meta0.getValue()).toMatchInlineSnapshot(`
      {
        "ideaId": "idea1",
        "other": {
          "x": 1,
        },
        "reqDurationMs": 1,
        "userId": "user1",
      }
    `)
  })

  it("mergeValues", () => {
    const result = Meta0.mergeValues(
      {
        reqDurationMs: 1,
        userId: "user1",
      },
      {
        reqDurationMs: 2,
        ideaId: "idea2",
        other: {
          x: 4,
        },
      },
      {},
      {
        reqDurationMs: 3,
        ideaId: "idea3",
        other: {
          x: 1,
        },
      },
    )
    expect(result).toMatchInlineSnapshot(`
      {
        "ideaId": "idea3",
        "other": {
          "x": 1,
        },
        "reqDurationMs": 3,
        "userId": "user1",
      }
    `)
  })

  it("#assign", () => {
    const meta0 = Meta0.create({
      reqDurationMs: 1,
      userId: "user1",
    })
    meta0.assign({
      reqDurationMs: 2,
      ideaId: "idea2",
      other: {
        x: 4,
      },
    })
    expect(meta0.getValue()).toMatchInlineSnapshot(`
      {
        "ideaId": "idea2",
        "other": {
          "x": 4,
        },
        "reqDurationMs": 2,
        "userId": "user1",
      }
    `)
  })

  it("extend", () => {
    const meta0 = Meta0.create({
      a: 1,
    })
    const meta1 = meta0.extend({
      b: 2,
    })
    expect(meta0.getValue()).toMatchInlineSnapshot(`
      {
        "a": 1,
      }
    `)
    expect(meta1.getValue()).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": 2,
      }
    `)
    meta0.assign({
      c: 3,
    })
    expect(meta0.getValue()).toMatchInlineSnapshot(`
      {
        "a": 1,
        "c": 3,
      }
    `)
    expect(meta1.getValue()).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": 2,
        "c": 3,
      }
    `)
  })

  it("getValueWithDeepReplacedValues", () => {
    const meta0 = Meta0.create({
      a: 1,
      b: 2,
      x: {
        z: 3,
        a: 2,
      },
    })
    expect(meta0.getValueWithDeepReplacedValues(["a"])).toMatchInlineSnapshot(`
      {
        "a": "*******",
        "b": 2,
        "x": {
          "a": "*******",
          "z": 3,
        },
      }
    `)
  })
})
