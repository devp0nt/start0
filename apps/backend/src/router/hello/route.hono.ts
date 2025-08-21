import { HonoApp } from "@shmoject/backend/lib/hono"
import { helloHonoRouteModel } from "./route.hono.model"

export const helloHonoRoute = HonoApp.defineRoute({
  model: helloHonoRouteModel,
  method: "get",
  path: "/hello",
})(({ honoApp, createRouteResult }) => {
  honoApp.openapi(createRouteResult, (c) => {
    const query = c.req.valid("query")
    return c.json({
      message: `Hello, ${query.name}`,
    })
  })
})
