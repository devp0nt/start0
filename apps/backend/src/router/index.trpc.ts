import { BackendTrpc } from "@shmoject/backend/lib/trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// @index('./**/route.trpc.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path}.js'`)
import { pingTrpcRoute } from "./ping/route.trpc.js";
// @endindex
// @index('../../../../general/src/**/route.trpc.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.replace('../../../../general', '@/general')}.js'`)

// @endindex

export namespace BackendTrpcRouter {
  export const self = BackendTrpc.createRouter({
    // @index('./**/route.trpc.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
    ping: pingTrpcRoute,
    // @endindex
    // @index('../../../../general/src/**/route.trpc.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)

    // @endindex
  });

  export type Type = typeof self;
  export type Input = inferRouterInputs<Type>;
  export type Output = inferRouterOutputs<Type>;
}
