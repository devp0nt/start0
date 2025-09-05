import { defaultShouldDehydrateQuery, HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCContext, createTRPCOptionsProxy, type TRPCQueryOptions } from "@trpc/tanstack-react-query"
import { cache, useState } from "react"
import superjson from "superjson"
import type { BackendTrpcRouter } from "@/backend/router/index.trpc"
import { env } from "@/site/lib/env.self"
import { RR0 } from "@/site/react-router/utils"

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined
export const getQueryClient = cache(() => {
  if (typeof window === "undefined") return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
})

const trpcContext = createTRPCContext<BackendTrpcRouter.TrpcRouter>()
const { TRPCProvider } = trpcContext
export const useTRPC = trpcContext.useTRPC

const HydrateClient = ({ children }: { children: React.ReactNode }) => {
  const dehydratedState = RR0.useDehydratedState()
  return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
}

export const prefetch = <T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) => {
  const queryClient = getQueryClient()
  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions as never)
  } else {
    void queryClient.prefetchQuery(queryOptions)
  }
}

const links = [
  loggerLink({
    enabled: (op) =>
      // process.env.NODE_ENV === "development" ||
      op.direction === "down" && op.result instanceof Error,
  }),
  httpBatchLink({
    transformer: superjson,
    url: env.VITE_TRPC_URL,
  }),
]

export const trpc = createTRPCOptionsProxy({
  client: createTRPCClient<BackendTrpcRouter.TrpcRouter>({
    links: links,
  }),
  queryClient: getQueryClient,
})

export const TRPCReactProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    createTRPCClient<BackendTrpcRouter.TrpcRouter>({
      links,
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <HydrateClient>{children}</HydrateClient>
      </TRPCProvider>
    </QueryClientProvider>
  )
}
