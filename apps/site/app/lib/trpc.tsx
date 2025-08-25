import type { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc"
import {
  type DehydratedState,
  defaultShouldDehydrateQuery,
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
import merge from "deepmerge"
import { cache, useState } from "react"
import { useMatches } from "react-router"
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
export const getQueryClient = cache(() => {
  if (typeof window === "undefined") return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
})

const trpcContext = createTRPCContext<BackendTrpcRouter.TrpcRouter>()
const { TRPCProvider } = trpcContext
export const useTRPC = trpcContext.useTRPC

const useDehydratedState = (): DehydratedState | undefined => {
  const matches = useMatches()
  const dehydratedState = matches
    .map(
      (match) =>
        (match.loaderData as { dehydratedState?: DehydratedState } | undefined)
          ?.dehydratedState,
    )
    .filter(Boolean) as DehydratedState[]
  return dehydratedState.length
    ? dehydratedState.reduce(
        (accumulator, currentValue) => merge(accumulator, currentValue),
        { mutations: [], queries: [] } as DehydratedState,
      )
    : undefined
}

const HydrateClient = ({ children }: { children: React.ReactNode }) => {
  const dehydratedState = useDehydratedState()
  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  )
}

export const prefetch = <T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) => {
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
    url: "http://localhost:3075/trpc",
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
        <HydrateClient>{children}</HydrateClient>
      </TRPCProvider>
    </QueryClientProvider>
  )
}
