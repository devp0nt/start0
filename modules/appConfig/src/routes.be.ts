import { BackendTrpc } from "@/backend/lib/trpc"

export const getAppConfigTrpcRoute = BackendTrpc.baseProcedure().query(async ({ ctx }) => {
  return { appConfig: { rubInUsd: 87 } }
})
