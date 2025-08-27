import { describe, expect, it } from "bun:test"
import { Meta0 } from "@shmoject/modules/lib/meta0.sh"

describe("meta0", () => {
  it("simple", () => {
    const meta0 = new Meta0({})
    expect(meta0).toBeInstanceOf(Meta0)
    expect(meta0.value).toMatchInlineSnapshot(`{}`)
  })

  it("full", () => {
    const meta0 = new Meta0({
      reqDurationMs: 1,
      userId: "user1",
      ideaId: "idea1",
      other: {
        x: 1,
      },
    })
    expect(meta0.value).toMatchInlineSnapshot(`
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
    const meta0 = new Meta0({
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
    expect(meta0.value).toMatchInlineSnapshot(`
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

  it("#assignFlat", () => {
    const meta0 = new Meta0({
      reqDurationMs: 1,
      userId: "user1",
    })
    meta0.assignFlat({
      reqDurationMs: 2,
      ideaId: "idea2",
      x: 4,
    })
    expect(meta0.value).toMatchInlineSnapshot(`
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
})
