import { BackendCtx } from "@shmoject/backend/lib/ctx";
import { Hono0 } from "@shmoject/backend/lib/hono";
import { applyHonoRoutes } from "@shmoject/backend/router/rest";

export const startApiProcess = async () => {
  const backendCtx = await BackendCtx.create();
  const { honoApp } = Hono0.createApp({
    backendCtx,
  });
  applyHonoRoutes({ honoApp });
  Bun.serve({
    fetch: honoApp.fetch,
    port: 3000,
  });
  console.log(`Hono is running at http://localhost:3000`);
};

if (import.meta.main) {
  startApiProcess();
}
