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
  backendTrpcRestAdminRoutesBasePath,
  backendTrpcRestAppRoutesBasePath,
  backendTrpcRoutesBasePath,
} from '@backend/shared/utils'
import {
  adminTrpcRouter,
  appTrpcRouter,
  applyTrpcOpenapiDocs,
  applyTrpcRestRouterToHono,
  applyTrpcRouterToHono,
  trpcRouter,
} from '@backend/trpc-router'
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
      name: 'Hono App',
      hono: honoApp,
      basePath: backendHonoAppRoutesBasePath,
    })
    applyTrpcOpenapiDocs({
      name: 'Trpc App',
      hono,
      basePath: backendTrpcRestAppRoutesBasePath,
      trpcRouter: appTrpcRouter,
    })
    applyHonoOpenapiDocs({
      name: 'Hono Admin',
      hono: honoAdmin,
      basePath: backendHonoAdminRoutesBasePath,
    })
    applyTrpcOpenapiDocs({
      name: 'Trpc Admin',
      hono,
      basePath: backendTrpcRestAdminRoutesBasePath,
      trpcRouter: adminTrpcRouter,
    })
    applyScalarDocs({
      hono,
      path: '/doc/app',
      sources: [
        { path: authOpenapiSchemaUrl, title: 'Auth' },
        { basePath: backendHonoAppRoutesBasePath, title: 'Hono App' },
        { basePath: backendTrpcRestAppRoutesBasePath, title: 'Trpc App' },
      ],
    })
    applyScalarDocs({
      hono,
      path: '/doc/admin',
      sources: [
        { path: authOpenapiSchemaUrl, title: 'Auth' },
        { basePath: backendHonoAdminRoutesBasePath, title: 'Hono Admin' },
        { basePath: backendTrpcRestAdminRoutesBasePath, title: 'Trpc Admin' },
      ],
    })

    // routes
    hono.route(backendHonoAppRoutesBasePath, honoApp)
    hono.route(backendHonoAdminRoutesBasePath, honoAdmin)
    applyTrpcRouterToHono({ hono, basePath: backendTrpcRoutesBasePath, trpcRouter })
    applyTrpcRestRouterToHono({ hono, basePath: backendTrpcRestAdminRoutesBasePath, trpcRouter: adminTrpcRouter })
    applyTrpcRestRouterToHono({ hono, basePath: backendTrpcRestAppRoutesBasePath, trpcRouter: appTrpcRouter })

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
