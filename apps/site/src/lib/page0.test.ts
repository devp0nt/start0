import { describe, expect, expectTypeOf, it } from "bun:test"
import { Route0 } from "@/lib/route0.sh"
import { Page0 } from "@/site/src/lib/page0"

const routeWithoutParams = Route0.create("/example")
const routeWithParams = routeWithoutParams.extend("/:id")

describe("Page0", () => {
  it("should create page without loader, without params", async () => {
    const page = Page0.route(routeWithoutParams).component(() => null)
    const samePage = Page0.create({
      route: routeWithoutParams,
      component: () => null,
    })
    expect(page).toMatchObject(samePage)
    expect(page).toBeDefined()
    expect(page).toBeInstanceOf(Page0)
    expect(page.route).toBe(routeWithoutParams)
    expect(page.loader).toBeUndefined()
    expect(page.component).toBeDefined()
    expectTypeOf<Parameters<typeof page.component>[0]["loaderData"]>().toEqualTypeOf<{}>()
    expectTypeOf<Parameters<typeof page.component>[0]["params"]>().toEqualTypeOf<{}>()
  })

  it("should create page without loader, with params", async () => {
    const page = Page0.route(routeWithParams).component(() => null)
    const samePage = Page0.create({
      route: routeWithParams,
      component: () => null,
    })
    expect(page).toMatchObject(samePage)
    expect(page).toBeDefined()
    expect(page).toBeInstanceOf(Page0)
    expect(page.route).toBe(routeWithParams)
    expect(page.loader).toBeUndefined()
    expect(page.component).toBeDefined()
    expectTypeOf<Parameters<typeof page.component>[0]["loaderData"]>().toEqualTypeOf<{}>()
    expectTypeOf<Parameters<typeof page.component>[0]["params"]>().toEqualTypeOf<{ id: string }>()
  })

  it("should create page with loader, without params", async () => {
    const page = Page0.route(routeWithoutParams)
      .loader(async () => ({ x: 1 }))
      .component(() => null)
    const samePage = Page0.create({
      route: routeWithoutParams,
      loader: async () => ({ x: 1 }),
      component: () => null,
    })
    expect(page).toMatchObject(samePage)
    expect(page).toBeDefined()
    expect(page).toBeInstanceOf(Page0)
    expect(page.route).toBe(routeWithoutParams)
    expect(page.loader).toBeDefined()
    expect(page.loader()).resolves.toEqual({ x: 1 })
    expect(page.component).toBeDefined()
    expectTypeOf<Parameters<typeof page.component>[0]["loaderData"]>().toEqualTypeOf<{ x: number }>()
    expectTypeOf<Parameters<typeof page.component>[0]["params"]>().toEqualTypeOf<{}>()
  })

  it("should create page with loader, with params", async () => {
    const page = Page0.route(routeWithParams)
      .loader(async () => ({ x: 1 }))
      .component(() => null)
    const samePage = Page0.create({
      route: routeWithParams,
      loader: async () => ({ x: 1 }),
      component: () => null,
    })
    expect(page).toMatchObject(samePage)
    expect(page).toBeDefined()
    expect(page).toBeInstanceOf(Page0)
    expect(page.route).toBe(routeWithParams)
    expect(page.loader).toBeDefined()
    expect(page.loader()).resolves.toEqual({ x: 1 })
    expect(page.component).toBeDefined()
    expectTypeOf<Parameters<typeof page.component>[0]["loaderData"]>().toEqualTypeOf<{ x: number }>()
    expectTypeOf<Parameters<typeof page.component>[0]["params"]>().toEqualTypeOf<{ id: string }>()
  })

  it("should create page with layout", async () => {
    const page = Page0.route(routeWithParams)
      .loader(async () => ({ x: 1 }))
      .layout("layout-path")
      .component(() => null)
    const samePage = Page0.create({
      route: routeWithParams,
      loader: async () => ({ x: 1 }),
      layout: "layout-path",
      component: () => null,
    })
    expect(page).toMatchObject(samePage)
    expect(page.layouts).toEqual(["layout-path"])
  })
})
