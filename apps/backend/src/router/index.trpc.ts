import { BackendTrpc } from "@ideanick/backend/lib/trpc"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

// @gen0:start await importExportedFromFiles("~/**/route{s,}.*.ts", "TrpcRoute")

import { getAppConfigTrpcRoute } from "../../../../modules/appConfig/routes.be.js"
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "../../../../modules/idea/routes.be.js"
import { pingTrpcRoute } from "./ping/route.trpc.js"
// @gen0:end

export namespace BackendTrpcRouter {
  export const trpcRouter = BackendTrpc.createTRPCRouter({
    // @gen0:start $.imports.map(im => print(`${im.cutted}: ${im.name},`))
    getIdeas: getIdeasTrpcRoute,
    getIdea: getIdeaTrpcRoute,
    getAppConfig: getAppConfigTrpcRoute,
    ping: pingTrpcRoute,
    // @gen0:end
  })

  export type TrpcRouter = typeof trpcRouter
  export type Input = inferRouterInputs<TrpcRouter>
  export type Output = inferRouterOutputs<TrpcRouter>
}
