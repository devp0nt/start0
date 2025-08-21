import { BackendCtx } from "@shmoject/backend/lib/ctx";
import { HonoApp } from "@shmoject/backend/lib/hono";
import { BackendTrpc } from "@shmoject/backend/lib/trpc";
import { BackendHonoRouter } from "@shmoject/backend/router/index.hono";
import { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc";
import { serve } from "bun";

export const startApiProcess = async () => {
  const backendCtx = await BackendCtx.create();
  const { honoApp } = HonoApp.create({
    backendCtx,
  });
  BackendHonoRouter.applyToHonoApp({ honoApp });
  BackendTrpc.applyToHonoApp({
    honoApp,
    trpcRouter: BackendTrpcRouter.self,
  });

  serve({
    fetch: honoApp.fetch,
    port: process.env.PORT,
  });
  console.log(`Hono is running at http://localhost:${process.env.PORT}`);
};

if (import.meta.main) {
  startApiProcess();
}
