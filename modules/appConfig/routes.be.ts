import { BackendTrpc } from '@backend/core/trpc'

export const getAppConfigTrpcRoute = BackendTrpc.baseProcedure().query(async ({ ctx }) => {
  return { appConfig: { rubInUsd: 87 } }
})
