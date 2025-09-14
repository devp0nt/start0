import { HonoApp } from "@backend/core/lib/hono"
import { BackendTrpc } from "@backend/core/lib/trpc"
import { trpcServer } from "@hono/trpc-server"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

// @gen0:start await importExportedFromFiles("~/**/route{s,}.ts", "TrpcRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import { getAppConfigTrpcRoute } from "@appConfig/backend/routes"
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "@idea/backend/routes"
import { pingTrpcRoute } from "@backend/trpc-router/ping/route"
// @gen0:end

export namespace BackendTrpcRouter {
  export const trpcRouter = BackendTrpc.createTRPCRouter({
    // @gen0:start $.imports.map(im => print(`${im.cutted}: ${im.name},`))
getAppConfig: getAppConfigTrpcRoute,
getIdeas: getIdeasTrpcRoute,
getIdea: getIdeaTrpcRoute,
ping: pingTrpcRoute,
    // @gen0:end
  })

  export type TrpcRouter = typeof trpcRouter
  export type Input = inferRouterInputs<TrpcRouter>
  export type Output = inferRouterOutputs<TrpcRouter>

  export const applyToHonoApp = ({ honoApp }: { honoApp: HonoApp.AppType }) => {
    honoApp.use(
      "/trpc/*",
      trpcServer({
        router: trpcRouter,
        createContext: (_opts, c: HonoApp.HonoCtx) => {
          const honoReqCtx = c.var.honoReqCtx.extend("trpc")
          const unextendable = honoReqCtx.getUnextendable()
          return { honoReqCtx, ...unextendable } satisfies BackendTrpc.TrpcCtx
        },
      }),
    )
  }
}
