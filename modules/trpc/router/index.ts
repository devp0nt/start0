import type { HonoBase, HonoCtx } from '@hono/backend'
import { createTrpcCtx, createTrpcRouter } from '@trpc/backend'
import { trpcServer } from '@hono/trpc-server'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// @gen0:start $.app = await importExportedFromFiles("~/**/route{s,}{.*,}{.be,}.ts", "AppTrpcRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import { getConfigAppTrpcRoute } from '@appConfig/backend/routes.be'
import { pingAppTrpcRoute } from '@trpc/router/ping/route'
// @gen0:end

// @gen0:start $.admin = await importExportedFromFiles("~/**/route{s,}{.*,}{.be,}.ts", "AdminTrpcRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))
// @gen0:end

const appTrpcRouter = {
  // @gen0:start $.app.imports.map(im => print(`${im.cutted}: ${im.name},`))
  getConfig: getConfigAppTrpcRoute,
  ping: pingAppTrpcRoute,
  // @gen0:end
}

const adminTrpcRouter = {
  // @gen0:start $.admin.imports.map(im => print(`${im.cutted}: ${im.name},`))
  // @gen0:end
}

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
  hono: HonoBase
  basePath: `/${string}`
  trpcRouter: any
}) => {
  hono.use(
    `${basePath}/*`,
    trpcServer({
      router: trpcRouter,
      createContext: (_opts, honoCtx: HonoCtx) => {
        return createTrpcCtx(honoCtx.var.honoReqCtx)
      },
    }),
  )
}
