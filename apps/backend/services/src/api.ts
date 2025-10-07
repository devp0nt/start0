import { applyAuthRoutesToHonoApp, authOpenapiSchemaUrl } from '@auth/backend/utils.be'
import { BackendCtx, Tri0 } from '@backend/core/ctx'
import {
  applyHonoErrorHandling,
  applyHonoLogging,
  applyHonoOpenapiDocs,
  applyHonoReqContext,
  applyScalarDocs,
  honoBase,
} from '@backend/core/hono'
import { honoAdmin, honoApp } from '@backend/hono-router'
import {
  backendHonoAdminRoutesBasePath,
  backendHonoAppRoutesBasePath,
  backendTrpcRoutesBasePath,
} from '@backend/shared/utils'
import { applyTrpcRouterToHono, trpcRouter } from '@backend/trpc-router'
import { serve } from 'bun'
import { cors } from 'hono/cors'

export const startApiProcess = async () => {
  const tri0 = Tri0.create()
  const backendCtx = BackendCtx.create({ tri0, service: 'api' })
  const { logger } = tri0.extend('root')
  try {
    await backendCtx.self.init()

    // general
    const hono = honoBase()
    applyHonoErrorHandling({ hono })
    hono.use(cors())
    applyHonoReqContext({ hono, backendCtx })
    applyHonoLogging({ hono })

    // auth
    applyAuthRoutesToHonoApp({ hono })

    // docs
    applyHonoOpenapiDocs({
      name: 'App',
      hono: honoApp,
      basePath: backendHonoAppRoutesBasePath,
    })
    applyHonoOpenapiDocs({
      name: 'Admin',
      hono: honoAdmin,
      basePath: backendHonoAdminRoutesBasePath,
    })
    applyScalarDocs({
      hono,
      path: '/doc/app',
      sources: [
        { path: authOpenapiSchemaUrl, title: 'Auth' },
        { basePath: backendHonoAppRoutesBasePath, title: 'App' },
      ],
    })
    applyScalarDocs({
      hono,
      path: '/doc/admin',
      sources: [
        { path: authOpenapiSchemaUrl, title: 'Auth' },
        { basePath: backendHonoAdminRoutesBasePath, title: 'Admin' },
      ],
    })

    // routes
    hono.route(backendHonoAppRoutesBasePath, honoApp)
    hono.route(backendHonoAdminRoutesBasePath, honoAdmin)
    applyTrpcRouterToHono({ hono, basePath: backendTrpcRoutesBasePath, trpcRouter })

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
