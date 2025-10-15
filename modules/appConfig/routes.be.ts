import { trpcBase } from '@trpc/backend'

export const getConfigAppTrpcRoute = trpcBase().query(async ({ ctx }) => {
  return { config: { rubInUsd: 87 } }
})
