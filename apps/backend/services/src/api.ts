import { BackendCtx } from '@backend/core/lib/ctx'
import { HonoApp } from '@backend/core/lib/hono'
import { BackendHonoRouter } from '@backend/hono-router'
import { BackendTrpcRouter } from '@backend/trpc-router'
import { serve } from 'bun'
import { cors } from 'hono/cors'

export const startApiProcess = async () => {
  let ctx: BackendCtx | null = null
  try {
    ctx = await BackendCtx.create({
      meta: {
        service: 'backend-api',
        tagPrefix: 'backend',
      },
      // biome-ignore lint/style/noProcessEnv: <x>
      env: process.env,
    })
    const { honoApp } = HonoApp.create({
      backendCtx: ctx,
    })

    honoApp.use(cors())
    HonoApp.applyLogging({ honoApp })
    HonoApp.applyErrorHandling({ honoApp })

    BackendHonoRouter.apply({ honoApp })
    BackendTrpcRouter.applyToHonoApp({ honoApp })

    serve({
      fetch: honoApp.fetch,
      port: ctx.env.PORT,
    })
    ctx.logger.info(`Hono is running at http://localhost:${ctx.env.PORT}`)
  } catch (e: any) {
    if (ctx) {
      ctx.logger.error(e)
      await ctx.destroy()
    } else {
      // biome-ignore lint/suspicious/noConsole: <fallback to native logger>
      console.dir(
        {
          level: 'error',
          message: e.message || 'Unknown error',
          service: 'backend-api',
          tag: 'backend:fatality',
          meta: e.meta,
        },
        { depth: null },
      )
    }
    process.exit(1)
  }
}

if (import.meta.main) {
  void startApiProcess()
}
