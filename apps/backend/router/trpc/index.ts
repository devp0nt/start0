import type { Hono0, HonoCtx } from '@backend/core/hono'
import { createTrpcCtx, createTrpcRouter } from '@backend/core/trpc'
import { createOpenApiHonoMiddleware } from '@backend/core/trpc-to-openapi-hono-adapter'
import { trpcServer } from '@hono/trpc-server'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { generateOpenApiDocument } from 'trpc-to-openapi'
import { appName } from '@apps/shared/utils'

// @gen0:start $.app = await importExportedFromFiles("~/**/route{s,}{.*,}{.be,}.ts", "AppTrpcRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import { pingAppTrpcRoute } from "@backend/trpc-router/ping/route"
// @gen0:end

// @gen0:start $.admin = await importExportedFromFiles("~/**/route{s,}{.*,}{.be,}.ts", "AdminTrpcRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import { ideaListAdminTrpcRoute, ideaGetAdminTrpcRoute, ideaCreateAdminTrpcRoute, ideaUpdateAdminTrpcRoute, ideaDeleteAdminTrpcRoute } from "/Users/iserdmi/cc/opensource/devp0nt/start0/modules/idea/routes.admin-trpc.be"
// @gen0:end

export const appTrpcRouter = createTrpcRouter({
  // @gen0:start $.app.imports.map(im => print(`${im.cutted}: ${im.name},`))
ping: pingAppTrpcRoute,
  // @gen0:end
})

export const adminTrpcRouter = createTrpcRouter({
  // @gen0:start $.admin.imports.map(im => print(`${im.cutted}: ${im.name},`))
ideaList: ideaListAdminTrpcRoute,
ideaGet: ideaGetAdminTrpcRoute,
ideaCreate: ideaCreateAdminTrpcRoute,
ideaUpdate: ideaUpdateAdminTrpcRoute,
ideaDelete: ideaDeleteAdminTrpcRoute,
  // @gen0:end
})

export const trpcRouter = createTrpcRouter({
  app: appTrpcRouter,
  admin: adminTrpcRouter,
})

export type TrpcRouter = typeof trpcRouter
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>

export const applyTrpcRouterToHono = ({
  hono,
  basePath,
  trpcRouter,
}: {
  hono: Hono0
  basePath: `/${string}`
  trpcRouter: any
}) => {
  hono.use(
    `${basePath}/*`,
    trpcServer({
      router: trpcRouter,
      createContext: (_opts, honoCtx: HonoCtx) => {
        return createTrpcCtx(honoCtx)
      },
    }),
  )
}

export const applyTrpcRestRouterToHono = ({
  hono,
  basePath,
  trpcRouter,
}: {
  hono: Hono0
  basePath: `/${string}`
  trpcRouter: any
}) => {
  hono.use(
    `${basePath}/*`,
    createOpenApiHonoMiddleware({
      router: trpcRouter,
      createContext: ({ req, res }: any) => {
        const honoCtx = req.honoContext
        if (honoCtx) {
          return createTrpcCtx(honoCtx)
        }
        throw new Error('Hono context not found')
      },
    }),
  )
}

export const applyTrpcOpenapiDocs = ({
  hono,
  basePath,
  name,
  trpcRouter,
}: {
  hono: Hono0
  basePath: `/${string}`
  name: string
  trpcRouter: any
}) => {
  const openApiDocument = generateOpenApiDocument(trpcRouter, {
    title: `${appName} ${name}`,
    baseUrl: basePath,
    version: '1.0.0',
  })
  hono.get(`${basePath}/doc.json`, (c) => {
    return c.json(openApiDocument, 200)
  })
}
