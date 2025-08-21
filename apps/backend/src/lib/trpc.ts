import { trpcServer } from "@hono/trpc-server";
import { HonoApp } from "@shmoject/backend/lib/hono";
import { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc";
import { initTRPC } from "@trpc/server";

export namespace BackendTrpc {
  export type Context = HonoApp.ContextVariables;

  const t = initTRPC.context<Context>().create();

  const procedure = t.procedure;

  export const baseProcedure = () => procedure;

  export const createRouter = t.router;

  export const applyToHonoApp = ({
    honoApp,
    trpcRouter,
  }: {
    honoApp: HonoApp.AppType;
    trpcRouter: BackendTrpcRouter.TrpcRouter;
  }) => {
    honoApp.use(
      "/trpc/*",
      trpcServer({
        router: trpcRouter,
        createContext: (_opts, c: HonoApp.Context) => c.var as Context,
      })
    );
  };
}
