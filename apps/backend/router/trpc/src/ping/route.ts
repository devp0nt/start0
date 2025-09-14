import { BackendTrpc } from "@backend/core/lib/trpc"

// TODO: combine all routes into one file and use generator to find desired routes

export const pingTrpcRoute = BackendTrpc.baseProcedure().query(async () => {
  return {
    message: "pong",
  }
})
