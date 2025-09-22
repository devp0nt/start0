import { BackendCtx } from '@backend/core/lib/ctx'
import { HonoApp } from '@backend/core/lib/hono'
import { T0 } from '@backend/core/lib/tri0'
import { BackendHonoRouter } from '@backend/hono-router'
import { BackendTrpcRouter } from '@backend/trpc-router'
import { serve } from 'bun'
import { cors } from 'hono/cors'

export const startApiProcess = async () => {
  const tri0 = T0.create()
  const ctx = BackendCtx.create({ tri0, service: 'api' })
  const { logger } = tri0.extend('root')
  try {
    await ctx.self.init()
    const { honoApp } = HonoApp.create({ backendCtx: ctx })

    honoApp.use(cors())
    HonoApp.applyLogging({ honoApp })
    HonoApp.applyErrorHandling({ honoApp })

    BackendHonoRouter.apply({ honoApp })
    BackendTrpcRouter.applyToHonoApp({ honoApp })

    serve({
      fetch: honoApp.fetch,
      port: ctx.env.PORT,
    })
    logger.info(`Hono is running at http://localhost:${ctx.env.PORT}`)
  } catch (e: any) {
    logger.error(e)
    await ctx.self.destroy()
  }
}

if (import.meta.main) {
  void startApiProcess()
}
