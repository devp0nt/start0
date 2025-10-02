import { applyAuthRoutesToHonoApp } from '@auth/backend/utils.be'
import { BackendCtx, Tri0 } from '@backend/core/ctx'
import { HonoApp } from '@backend/core/hono'
import { BackendHonoRouter } from '@backend/hono-router'
import { backendAdminRoutesBasePath, backendAppRoutesBasePath } from '@backend/shared/utils'
import { BackendTrpcRouter } from '@backend/trpc-router'
import { serve } from 'bun'
import { cors } from 'hono/cors'

export const startApiProcess = async () => {
  const tri0 = Tri0.create()
  const ctx = BackendCtx.create({ tri0, service: 'api' })
  const { logger } = tri0.extend('root')
  try {
    await ctx.self.init()
    const honoApp = HonoApp.create()

    HonoApp.applyErrorHandling({ honoApp })
    honoApp.use(
      cors({
        origin: (origin) => origin || '*',
        credentials: true,
      }),
    )
    HonoApp.applyContext({ honoApp, backendCtx: ctx })
    HonoApp.applyLogging({ honoApp })
    applyAuthRoutesToHonoApp({ honoApp })
    const appHonoApp = HonoApp.create()
    const adminHonoApp = HonoApp.create()
    BackendHonoRouter.applyAdminRoutes({ honoApp: appHonoApp })
    BackendHonoRouter.applyAppRoutes({ honoApp: adminHonoApp })
    BackendTrpcRouter.applyToHonoApp({ honoApp })
    HonoApp.applyOpenapiDocs({ ctx, honoApp: appHonoApp, basePath: backendAdminRoutesBasePath })
    HonoApp.applyOpenapiDocs({ ctx, honoApp: adminHonoApp, basePath: backendAppRoutesBasePath })
    HonoApp.applySaturnDocs({ honoApp: adminHonoApp, basePath: backendAppRoutesBasePath })
    HonoApp.applySwaggerDocs({ honoApp: adminHonoApp, basePath: backendAppRoutesBasePath })
    honoApp.route(backendAppRoutesBasePath, appHonoApp)
    honoApp.route(backendAdminRoutesBasePath, adminHonoApp)

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
