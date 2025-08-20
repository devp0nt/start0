import { TrpcBackend } from "@shmoject/backend/lib/trpc";

export const pingTrpcRoute = TrpcBackend.baseProcedure.query(async () => {
  return {
    message: "pong",
  };
});
