import { trpcBase } from '@backend/core/trpc'

export const getConfigAppTrpcRoute = trpcBase().query(async ({ ctx }) => {
  return { config: { rubInUsd: 87 } }
})
