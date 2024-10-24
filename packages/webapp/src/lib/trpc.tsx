import type { TrpcRouter } from '@/backend/src/router/trpc/index.js'
import { getOneEnv, isDevelopmentNodeEnv } from '@/webapp/src/lib/env.js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink, type TRPCLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { observable } from '@trpc/server/observable'
import { useState } from 'react'
import superjson from 'superjson'

export * from '@trpc/react-query/shared'

export const trpc = createTRPCReact<TrpcRouter>()

const customTrpcLink: TRPCLink<TrpcRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value)
        },
        error(error) {
          if (!error.data?.expected) {
            if (isDevelopmentNodeEnv()) {
              // TODO:ASAP add webapp logger
              // eslint-disable-next-line no-console
              console.error(error)
            }
          }
          observer.error(error)
        },
        complete() {
          observer.complete()
        },
      })
      return unsubscribe
    })
  }
}

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        customTrpcLink,
        loggerLink({
          enabled: () => isDevelopmentNodeEnv(),
        }),
        httpBatchLink({
          transformer: superjson,
          url: `${getOneEnv('VITE_BACKEND_URL')}/trpc`,
          // headers: () => {
          //   const token = Cookies.get('svagatron-token')
          //   return {
          //     ...(token && { authorization: `Bearer ${token}` }),
          //   }
          // },
        }),
      ],
    })
  )

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      })
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
