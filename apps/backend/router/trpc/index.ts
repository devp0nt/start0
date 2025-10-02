import type { Hono0, HonoCtx } from '@backend/core/hono'
import { createTrpcCtx, createTrpcRouter } from '@backend/core/trpc'
import { trpcServer } from '@hono/trpc-server'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// @gen0:start await importExportedFromFiles("~/**/route{s,}{.*,}{.be,}.ts", "TrpcRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import { getAppConfigTrpcRoute } from '@appConfig/backend/routes.be'
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from '@idea/backend/routes.be'
import { pingTrpcRoute } from '@backend/trpc-router/ping/route'
// @gen0:end

const trpcRouter = createTrpcRouter({
  // @gen0:start $.imports.map(im => print(`${im.cutted}: ${im.name},`))
  getAppConfig: getAppConfigTrpcRoute,
  getIdeas: getIdeasTrpcRoute,
  getIdea: getIdeaTrpcRoute,
  ping: pingTrpcRoute,
  // @gen0:end
})

export type TrpcRouter = typeof trpcRouter
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>

export const applyTrpcRouterToHono = ({ hono }: { hono: Hono0 }) => {
  hono.use(
    '/trpc/*',
    trpcServer({
      router: trpcRouter,
      createContext: (_opts, honoCtx: HonoCtx) => {
        return createTrpcCtx(honoCtx)
      },
    }),
  )
}
