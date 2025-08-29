import { describe, expect, it } from "bun:test"
import { Route0 } from "@shmoject/modules/lib/route0.sh"

describe("meta0", () => {
  it("simple", () => {
    const route0 = new Route0("/")
    const path = route0.get()
    expect(path).toBe("/")
  })

  it("params", () => {
    const route0 = new Route0("/prefix/:x/some/:y/:z")
    const path = route0.get({ x: "1", y: 2, z: "3" })
    expect(path).toBe("/prefix/1/some/2/3")
  })

  it("search params", () => {
    const route0 = new Route0("/prefix&y&z")
    const path = route0.get({ searchParams: { y: "1", z: "2" } })
    expect(path).toBe("/prefix?y=1&z=2")
  })

  it("params and search params", () => {
    const route0 = new Route0("/prefix/:x/some/:y/:z&z&c")
    const path = route0.get({ x: "1", y: "2", z: "3" }, { z: "4", c: "5" })
    expect(path).toBe("/prefix/1/some/2/3?z=4&c=5")
  })

  it("simple extend", () => {
    const route0 = new Route0("/prefix")
    const route1 = route0.extend("/suffix")
    const path = route1.get()
    expect(path).toBe("/prefix/suffix")
  })

  it("extend with params", () => {
    const route0 = new Route0("/prefix/:x")
    const route1 = route0.extend("/suffix/:y")
    const path = route1.get({ x: "1", y: "2" })
    expect(path).toBe("/prefix/1/suffix/2")
  })

  it("extend with search params", () => {
    const route0 = new Route0("/prefix&y&z")
    const route1 = route0.extend("/suffix&z&c")
    const path = route1.get({ searchParams: { z: "2", c: "3" } })
    expect(path).toBe("/prefix/suffix?z=2&c=3")
  })
})
