import { honoBase } from '@hono/backend'
import { createRoute } from '@hono/zod-openapi'
import z from 'zod'

export const pingAppHonoRoute = honoBase().openapi(
  createRoute({
    method: 'get',
    path: '/ping',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.object({
              pong: z.string(),
            }),
          },
        },
        description: 'Success',
      },
    },
  }),
  (c) => {
    return c.json({
      pong: 'shmong',
    })
  },
)

export const bigPingAppHonoRoute = honoBase().openapi(
  createRoute({
    method: 'get',
    path: '/big/ping',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.object({
              badapong: z.string(),
            }),
          },
        },
        description: 'Success',
      },
    },
  }),
  (c) => {
    return c.json({
      badapong: 'badashmong',
    })
  },
)
