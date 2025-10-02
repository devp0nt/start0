import { applyAuthRoutesToHonoApp } from '@auth/backend/utils.be'
import { BackendCtx, Tri0 } from '@backend/core/ctx'
import {
  applyHonoErrorHandling,
  applyHonoLogging,
  applyHonoOpenapiDocs,
  applyHonoReqContext,
  honoBase,
} from '@backend/core/hono'
import { honoAdmin, honoApp } from '@backend/hono-router'
import { backendAdminRoutesBasePath, backendAppRoutesBasePath } from '@backend/shared/utils'
import { applyTrpcRouterToHono } from '@backend/trpc-router'
import { serve } from 'bun'
import { cors } from 'hono/cors'

export const startApiProcess = async () => {
  const tri0 = Tri0.create()
  const backendCtx = BackendCtx.create({ tri0, service: 'api' })
  const { logger } = tri0.extend('root')
  try {
    await backendCtx.self.init()
    const hono = honoBase()
    applyHonoErrorHandling({ hono })
    hono.use(cors())
    applyHonoReqContext({ hono, backendCtx })
    applyHonoLogging({ hono })
    applyAuthRoutesToHonoApp({ hono })
    applyHonoOpenapiDocs({
      name: 'App',
      hono: honoApp,
      basePath: backendAppRoutesBasePath,
      backendCtx,
    })
    applyHonoOpenapiDocs({
      name: 'Admin',
      hono: honoAdmin,
      basePath: backendAdminRoutesBasePath,
      backendCtx,
    })
    hono.route(backendAppRoutesBasePath, honoApp)
    hono.route(backendAdminRoutesBasePath, honoAdmin)
    applyTrpcRouterToHono({ hono })

    serve({
      fetch: hono.fetch,
      port: backendCtx.env.PORT,
    })
    logger.info(`Hono is running at http://localhost:${backendCtx.env.PORT}`)

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 60 * 60 * 1000))
      logger.info(`Api is still alive`)
    }
  } catch (e: any) {
    logger.error(e)
    await backendCtx.self.destroy()
  }
}

if (import.meta.main) {
  void startApiProcess()
}
