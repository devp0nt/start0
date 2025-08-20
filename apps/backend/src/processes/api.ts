import { CtxBackend } from "@shmoject/backend/lib/ctx";
import { HonoBackend } from "@shmoject/backend/lib/hono";
import { TrpcBackend } from "@shmoject/backend/lib/trpc";
import { HonoRouter } from "@shmoject/backend/router/index.hono";
import { TrpcBackendRouter } from "@shmoject/backend/router/index.trpc";
import { serve } from "bun";

export const startApiProcess = async () => {
  const ctxBackend = await CtxBackend.create();
  const { honoApp } = HonoBackend.createApp({
    ctxBackend,
  });
  HonoRouter.applyToHonoApp({ honoApp });
  TrpcBackend.applyToHonoApp({
    honoApp,
    trpcRouter: TrpcBackendRouter.self,
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
