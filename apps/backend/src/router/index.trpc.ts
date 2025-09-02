import { BackendTrpc } from "@ideanick/backend/lib/trpc"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

// @gen0:start store.x = await importFromTsFiles({ globPattern: "~/**/route{s,}.*.ts", exportEndsWith: "TrpcRoute" })

import { getAppConfigTrpcRoute } from "../../../../modules/appConfig/routes.be.js"
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "../../../../modules/idea/routes.be.js"
import { pingTrpcRoute } from "./ping/route.trpc.js"
// @gen0:end
export namespace BackendTrpcRouter {
  export const trpcRouter = BackendTrpc.createTRPCRouter({
    // @gen0:start store.x.exportNames.map(name => print(`    ${name.replace("TrpcRoute", "")}: ${name},`))

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
