import { trpcServer } from "@hono/trpc-server";
import { HonoBackend } from "@shmoject/backend/lib/hono";
import { TrpcRouter } from "@shmoject/backend/router/index.trpc";
import { initTRPC } from "@trpc/server";

export namespace TrpcBackend {
  const t = initTRPC.create();

  const procedure = t.procedure;

  export const baseProcedure = procedure;

  export const createRouter = t.router;

  export const applyToHonoApp = ({
    honoApp,
    trpcRouter,
  }: {
    honoApp: HonoBackend.App;
    trpcRouter: TrpcRouter.Type;
  }) => {
    honoApp.use("/trpc/*", trpcServer({ router: trpcRouter }));
  };
}
