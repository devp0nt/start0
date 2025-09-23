import type { BackendTrpcRouter } from '@backend/trpc-router'
import { env } from '@site/core/lib/env.self'
import { RR0 } from '@site/core/lib/rr0'
import { defaultShouldDehydrateQuery, HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCContext, createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { cache, useState } from 'react'
import superjson from 'superjson'

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined
export const getQueryClient = cache(() => {
  if (typeof window === 'undefined') return makeQueryClient()
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

// export const prefetch = (queryOptions: ReturnType<TRPCQueryOptions<any>>) => {
//   const queryClient = getQueryClient()
//   if (queryOptions.queryKey[1]?.type === 'infinite') {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any -- ok
//     void queryClient.prefetchInfiniteQuery(queryOptions as any)
//   } else {
//     void queryClient.prefetchQuery(queryOptions)
//   }
// }

const links = [
  loggerLink({
    enabled: (op) =>
      // process.env.NODE_ENV === "development" ||
      op.direction === 'down' && op.result instanceof Error,
  }),
  httpBatchLink({
    transformer: superjson,
    url: env.VITE_TRPC_URL,
  }),
]

export const trpc = createTRPCOptionsProxy({
  client: createTRPCClient<BackendTrpcRouter.TrpcRouter>({
    links,
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
