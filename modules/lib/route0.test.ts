import { describe, expect, expectTypeOf, it } from "bun:test"
import { Route0 } from "@shmoject/modules/lib/route0.sh"

describe("meta0", () => {
  it("simple", () => {
    const route0 = Route0.create("/")
    const path = route0.get()
    expect(path).toBe("/")
  })

  it("params", () => {
    const route0 = Route0.create("/prefix/:x/some/:y/:z")
    const path = route0.get({ x: "1", y: 2, z: "3" })
    expect(path).toBe("/prefix/1/some/2/3")
  })

  it("search params", () => {
    const route0 = Route0.create("/prefix&y&z")
    const path = route0.get({ query: { y: "1", z: "2" } })
    expect(path).toBe("/prefix?y=1&z=2")
  })

  it("params and search params", () => {
    const route0 = Route0.create("/prefix/:x/some/:y/:z&z&c")
    const path = route0.get({
      params: { x: "1", y: "2", z: "3" },
      query: { z: "4", c: "5" },
    })
    expect(path).toBe("/prefix/1/some/2/3?z=4&c=5")
  })

  it("simple extend", () => {
    const route0 = Route0.create("/prefix")
    const route1 = route0.extend("/suffix")
    const path = route1.get()
    expect(path).toBe("/prefix/suffix")
  })

  it("simple extend double slash", () => {
    const route0 = Route0.create("/")
    const route1 = route0.extend("/suffix1/")
    const route2 = route1.extend("/suffix2")
    const path = route2.get()
    expect(path).toBe("/suffix1/suffix2")
  })

  it("simple extend no slash", () => {
    const route0 = Route0.create("/")
    const route1 = route0.extend("suffix1")
    const route2 = route1.extend("suffix2")
    const path = route2.get()
    expect(path).toBe("/suffix1/suffix2")
  })

  it("extend with params", () => {
    const route0 = Route0.create("/prefix/:x")
    const route1 = route0.extend("/suffix/:y")
    const path = route1.get({ x: "1", y: "2" })
    expect(path).toBe("/prefix/1/suffix/2")
  })

  it("extend with search params", () => {
    const route0 = Route0.create("/prefix&y&z")
    const route1 = route0.extend("/suffix&z&c")
    const path = route1.get({ query: { y: "2", c: "3", a: "4" } })
    expectTypeOf<(typeof route1)["queryDefinition"]>().toEqualTypeOf<{
      y: true
      z: true
      c: true
    }>()
    expect(path).toBe("/prefix/suffix?y=2&c=3&a=4")
  })

  it("abs default", () => {
    const route0 = Route0.create("/path")
    const path = route0.get({ abs: true })
    expect(path).toBe("https://example.com/path")
  })

  it("abs set", () => {
    const route0 = Route0.create("/path", "https://x.com")
    const path = route0.get({ abs: true })
    expect(path).toBe("https://x.com/path")
  })

  it("abs override", () => {
    const route0 = Route0.create("/path", "https://x.com")
    route0.baseUrl = "https://y.com"
    const path = route0.get({ abs: true })
    expect(path).toBe("https://y.com/path")
  })

  it("abs override extend", () => {
    const route0 = Route0.create("/path", "https://x.com")
    route0.baseUrl = "https://y.com"
    const route1 = route0.extend("/suffix")
    const path = route1.get({ abs: true })
    expect(path).toBe("https://y.com/path/suffix")
  })

  it("abs override many", () => {
    const route0 = Route0.create("/path", "https://x.com")
    const route1 = route0.extend("/suffix")
    const routes = {
      r0: route0,
      r1: route1,
    }
    const routes2 = Route0.replaceManyBaseUrl(routes, "https://z.com")
    const path = routes2.r1.get({ abs: true })
    expect(path).toBe("https://z.com/path/suffix")
  })
})
