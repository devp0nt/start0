import { BackendTrpc } from "@shmoject/backend/lib/trpc"

export const pingTrpcRoute = BackendTrpc.baseProcedure().query(async () => {
  return {
    message: "pong",
  }
})
