import z from "zod"
import type { HonoApp } from "@/backend/lib/hono"

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
