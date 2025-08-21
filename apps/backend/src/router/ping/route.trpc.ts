import { BackendTrpc } from "@shmoject/backend/lib/trpc";

export const pingTrpcRoute = BackendTrpc.baseProcedure().query(
  async ({ ctx }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      message: "pong",
    };
  }
);
