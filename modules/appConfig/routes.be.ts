import { BackendTrpc } from "@shmoject/backend/lib/trpc"

export const getAppConfigTrpcRoute = BackendTrpc.baseProcedure().query(async ({ ctx }) => {
  return { appConfig: { rubInUsd: 87 } }
})
