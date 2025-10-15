import { applyAuthRoutesToHonoApp, authOpenapiSchemaUrl } from '@auth/backend/utils'
import { baseTri0 } from '@backend/base/tri0'
import { backendCtx } from '@backend/ctx'
import {
  applyHonoErrorHandling,
  applyHonoLogging,
  applyHonoOpenapiDocs,
  applyHonoReqContext,
  applyScalarDocs,
  honoBase,
} from '@hono/backend'
import { applyUncaughtExceptionCatcher } from '@backend/core/uncaught'
import { honoAdmin, honoApp } from '@hono/router'
import {
  backendHonoAdminRoutesBasePath,
  backendHonoAppRoutesBasePath,
  backendTrpcRoutesBasePath,
} from '@backend/shared/utils'
import { applyTrpcRouterToHono, trpcRouter } from '@trpc/router'
import { serve } from 'bun'
import { cors } from 'hono/cors'

const tri0 = baseTri0.extend({
  service: 'api',
})

export const startApiProcess = async () => {
  await backendCtx.self.init({ tri0 })
  const { logger } = backendCtx.tri0.extend('api')

  // general
  const hono = honoBase()
  hono.use(
    cors({
      origin: [backendCtx.env.ADMIN_URL, backendCtx.env.SITE_URL],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    }),
  )
  applyHonoReqContext({ hono, backendCtx })
  applyHonoLogging({ hono })
  applyHonoErrorHandling({ hono })
  applyAuthRoutesToHonoApp({ hono })

  // docs
  applyHonoOpenapiDocs({
    name: 'App',
    hono,
    routes: honoApp,
    basePath: backendHonoAppRoutesBasePath,
  })
  applyHonoOpenapiDocs({
    name: 'Admin',
    hono,
    routes: honoAdmin,
    basePath: backendHonoAdminRoutesBasePath,
  })
  applyScalarDocs({
    hono,
    path: backendHonoAppRoutesBasePath,
    sources: [
      { basePath: backendHonoAppRoutesBasePath, title: 'App' },
      { path: authOpenapiSchemaUrl, title: 'Auth' },
    ],
  })
  applyScalarDocs({
    hono,
    path: backendHonoAdminRoutesBasePath,
    sources: [
      { basePath: backendHonoAdminRoutesBasePath, title: 'Admin' },
      { path: authOpenapiSchemaUrl, title: 'Auth' },
    ],
  })

  // routes
  applyTrpcRouterToHono({ hono, basePath: backendTrpcRoutesBasePath, trpcRouter })
  hono.route(backendHonoAdminRoutesBasePath, honoAdmin)
  hono.route(backendHonoAppRoutesBasePath, honoApp)

  serve({
    fetch: hono.fetch,
    port: backendCtx.env.PORT,
  })
  logger.info(`Hono is running at http://localhost:${backendCtx.env.PORT}`)

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 60 * 60 * 1000))
    logger.info(`Api is still alive`)
  }
}

if (import.meta.main) {
  applyUncaughtExceptionCatcher({ tri0, ctx: backendCtx })
  void startApiProcess()
}
