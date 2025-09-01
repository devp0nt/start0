import { BackendTrpc } from "@ideanick/backend/lib/trpc"
import { getAppConfigTrpcRoute } from "@ideanick/modules/appConfig/routes.be.js"
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "@ideanick/modules/idea/routes.be.js"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

// gen0 importTrpcRoutes()
// /gen0

// @index('./**/route.trpc.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path}.js'`)
import { pingTrpcRoute } from "./ping/route.trpc.js"

// @endindex
// @index('../../../../general/src/**/route.trpc.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.replace('../../../../general', '@/general')}.js'`)

// @endindex
export namespace BackendTrpcRouter {
  export const trpcRouter = BackendTrpc.createTRPCRouter({
    // gen0 provideTrpcRoutes()
    // /gen0

    // @index('./**/route.trpc.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
    ping: pingTrpcRoute,
    // @endindex
    // @index('../../../../general/src/**/route.trpc.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)

    // @endindex
    getIdeas: getIdeasTrpcRoute,
    getIdea: getIdeaTrpcRoute,
    getAppConfig: getAppConfigTrpcRoute,
  })

  export type TrpcRouter = typeof trpcRouter
  export type Input = inferRouterInputs<TrpcRouter>
  export type Output = inferRouterOutputs<TrpcRouter>
}
