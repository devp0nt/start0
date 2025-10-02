import { honoBase } from '@backend/core/hono'
import { createRoute } from '@hono/zod-openapi'
import z from 'zod'

export const helloAppHonoRoute = honoBase().openapi(
  createRoute({
    method: 'get',
    path: '/hello',
    request: {
      query: z.object({
        name: z.string().optional().default('world'),
      }),
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: 'Success',
      },
    },
  }),
  (c) => {
    const query = c.req.valid('query')
    return c.json({
      message: `Hello, ${query.name}`,
    })
  },
)
