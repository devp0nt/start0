import { BackendTrpc } from "@backend/trpc"

export const getAppConfigTrpcRoute = BackendTrpc.baseProcedure().query(async ({ ctx }) => {
  return { appConfig: { rubInUsd: 87 } }
})
