import { trpcBase } from '@backend/core/trpc'

export const getAppConfigTrpcRoute = trpcBase().query(async ({ ctx }) => {
  return { appConfig: { rubInUsd: 87 } }
})
