import { HonoApp } from "@shmoject/backend/lib/hono"

export const pingHonoRoute = HonoApp.defineRoute({
  method: "get",
  path: "/ping",
})(({ honoApp, createRouteResult }) => {
  honoApp.openapi(createRouteResult, (c) => {
    return c.json({
      message: "pong",
    })
  })
})
