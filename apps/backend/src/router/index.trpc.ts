import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { BackendTrpc } from "@/backend/lib/trpc"

// @gen0:start await importExportedFromFiles("~/**/route{s,}.*.ts", "TrpcRoute")

import { getAppConfigTrpcRoute } from "../../../../modules/appConfig/src/routes.be.js"
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "../../../../modules/idea/src/routes.be.js"
import { pingTrpcRoute } from "./ping/route.trpc.js"
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
}
