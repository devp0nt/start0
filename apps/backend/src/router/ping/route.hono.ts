import type { HonoApp } from "@shmoject/backend/lib/hono"
import z from "zod"

export const pingHonoRoute = ({ honoApp }: { honoApp: HonoApp.AppType }) =>
  honoApp.openapi(
    {
      method: "get",
      path: "/ping",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
          description: "Success",
        },
      },
    },
    (c) => {
      return c.json({
        message: "pong",
      })
    },
  )
