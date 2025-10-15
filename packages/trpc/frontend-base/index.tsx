import { backendTrpcRoutesBasePath } from '@backend/shared/utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client'
import type { TrpcRouter } from '@trpc/router'
import { createTRPCContext, createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import superjson from 'superjson'
import { sharedEnv } from '@shared/base/env.runtime'

export const queryClient = new QueryClient()

const links = [
  loggerLink({
    enabled: (op) =>
      // process.env.NODE_ENV === "development" ||
      op.direction === 'down' && op.result instanceof Error,
  }),
  httpBatchLink({
    transformer: superjson,
    // TODO: use sharedEnv form updated Env0 package
    url:
      (sharedEnv.VITE_BACKEND_URL || process.env.BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL) +
      backendTrpcRoutesBasePath,
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

export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export const TrpcReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactQueryProvider>
      <TrpcProvider>{children}</TrpcProvider>
    </ReactQueryProvider>
  )
}
