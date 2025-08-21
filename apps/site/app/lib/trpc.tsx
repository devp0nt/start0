import type { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc"
import {
  defaultShouldDehydrateQuery,
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client"
import {
  createTRPCContext,
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query"
import { cache, useState } from "react"
import superjson from "superjson"

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export const getQueryClientCache = cache(makeQueryClient)

const trpcContext = createTRPCContext<BackendTrpcRouter.TrpcRouter>()
const { TRPCProvider } = trpcContext
export const useTRPC = trpcContext.useTRPC

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  )
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
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
      process.env.NODE_ENV === "development" ||
      (op.direction === "down" && op.result instanceof Error),
  }),
  httpBatchLink({
    transformer: superjson,
    url: "http://localhost:3075/trpc",
    headers() {
      const headers = new Headers()
      headers.set("x-trpc-source", "react")
      return headers
    },
  }),
]

export const trpc = createTRPCOptionsProxy({
  client: createTRPCClient<BackendTrpcRouter.TrpcRouter>({
    links: links,
  }),
  queryClient: getQueryClient,
})

export const TRPCReactProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    createTRPCClient<BackendTrpcRouter.TrpcRouter>({
      links,
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
