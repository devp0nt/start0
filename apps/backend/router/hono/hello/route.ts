import type { HonoApp } from "@backend/core/lib/hono"
import z from "zod"

export const helloHonoRoute = ({ honoApp }: { honoApp: HonoApp.AppType }) =>
  honoApp.openapi(
    {
      method: "get",
      path: "/hello",
      request: {
        query: z.object({
          name: z.string().optional().default("world"),
        }),
      },
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
      const query = c.req.valid("query")
      return c.json({
        message: `Hello, ${query.name}`,
      })
    },
  )
