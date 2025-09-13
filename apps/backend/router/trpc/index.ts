import { HonoApp } from "@backend/core/lib/hono"
import { BackendTrpc } from "@backend/core/lib/trpc"
import { trpcServer } from "@hono/trpc-server"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

// @gen0:start await importExportedFromFiles("~/**/route{s,}.*.ts", "TrpcRoute")

import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "@/idea/backend/routes.be.js"
import { getAppConfigTrpcRoute } from "../../../../modules/appConfig/src/routes.be.js"
import { pingTrpcRoute } from "./ping/route.js"
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

  export const applyToHonoApp = ({
    honoApp,
    trpcRouter,
  }: {
    honoApp: HonoApp.AppType
    trpcRouter: BackendTrpcRouter.TrpcRouter
  }) => {
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
