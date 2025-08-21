import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<BackendTrpcRouter.Type>();
