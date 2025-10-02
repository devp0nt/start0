import { honoBase } from '@backend/core/hono'
import z from 'zod'

export const pingAppHonoRoute = honoBase().openapi(
  {
    method: 'get',
    path: '/ping',
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
  },
  (c) => {
    return c.json({
      message: 'pong',
    })
  },
)
