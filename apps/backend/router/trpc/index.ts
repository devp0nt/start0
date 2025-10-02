import type { HonoApp } from '@backend/core/hono'
import { BackendTrpc } from '@backend/core/trpc'
import { trpcServer } from '@hono/trpc-server'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

// @gen0:start await importExportedFromFiles("~/**/route{s,}.ts", "TrpcRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import { pingTrpcRoute } from "@backend/trpc-router/ping/route"
// @gen0:end

export namespace BackendTrpcRouter {
  export type TrpcRouter = typeof trpcRouter
  export type Input = inferRouterInputs<TrpcRouter>
  export type Output = inferRouterOutputs<TrpcRouter>

  const trpcRouter = BackendTrpc.createTRPCRouter({
    // @gen0:start $.imports.map(im => print(`${im.cutted}: ${im.name},`))
ping: pingTrpcRoute,
    // @gen0:end
  })

  export const applyToHonoApp = ({ honoApp }: { honoApp: HonoApp.AppType }) => {
    honoApp.use(
      '/trpc/*',
      trpcServer({
        router: trpcRouter,
        createContext: (_opts, honoCtx: HonoApp.HonoCtx) => {
          return BackendTrpc.createTrpcCtx(honoCtx)
        },
      }),
    )
  }
}
