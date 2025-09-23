import { BackendCtx, Tri0 } from '@backend/core/lib/ctx'
import { HonoApp } from '@backend/core/lib/hono'
import { BackendHonoRouter } from '@backend/hono-router'
import { BackendTrpcRouter } from '@backend/trpc-router'
import { serve } from 'bun'
import { cors } from 'hono/cors'

export const startApiProcess = async () => {
  const tri0 = Tri0.create()
  const ctx = BackendCtx.create({ tri0, service: 'api' })
  const { logger } = tri0.extend('root')
  try {
    await ctx.self.init()
    const { honoApp } = HonoApp.create({ backendCtx: ctx })

    HonoApp.applyErrorHandling({ honoApp })
    honoApp.use(cors())
    HonoApp.applyContextSetter({ honoApp, backendCtx: ctx })
    HonoApp.applyLogging({ honoApp })
    HonoApp.applyContextDestroyer({ honoApp })
    BackendHonoRouter.apply({ honoApp })
    BackendTrpcRouter.applyToHonoApp({ honoApp })

    serve({
      fetch: honoApp.fetch,
      port: ctx.env.PORT,
    })
    logger.info(`Hono is running at http://localhost:${ctx.env.PORT}`)

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 60 * 60 * 1000))
      logger.info(`Api is still alive`)
    }
  } catch (e: any) {
    logger.error(e)
    await ctx.self.destroy()
  }
}

if (import.meta.main) {
  void startApiProcess()
}
