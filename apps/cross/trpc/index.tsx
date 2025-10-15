import { env } from '@cross/base/lib/env.runtime'
import { backendTrpcRoutesBasePath } from '@backend/shared/utils'
import type { TrpcRouter } from '@backend/trpc-router'
import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCOptionsProxy, createTRPCContext } from '@trpc/tanstack-react-query'
import superjson from 'superjson'

export const queryClient = new QueryClient()

const links = [
  loggerLink({
    enabled: (op) =>
      // process.env.NODE_ENV === "development" ||
      op.direction === 'down' && op.result instanceof Error,
  }),
  httpBatchLink({
    transformer: superjson,
    url: env.EXPO_PUBLIC_BACKEND_URL + backendTrpcRoutesBasePath,
  }),
]

const trpcClient = createTRPCClient<TrpcRouter>({
  links,
})

export const trpc = createTRPCOptionsProxy<TrpcRouter>({
  client: trpcClient,
  queryClient,
})

const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<TrpcRouter>()

export const useTrpc = useTRPC
export const useTrpcClient = useTRPCClient
export const TrpcProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </TRPCProvider>
  )
}
