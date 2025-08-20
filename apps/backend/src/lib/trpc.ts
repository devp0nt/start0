import { trpcServer } from "@hono/trpc-server";
import { HonoBackend } from "@shmoject/backend/lib/hono";
import { TrpcRouter } from "@shmoject/backend/router/index.trpc";
import { initTRPC } from "@trpc/server";

export namespace TrpcBackend {
  export type Context = HonoBackend.ContextVariables;

  const t = initTRPC.context<Context>().create();

  const procedure = t.procedure;

  export const baseProcedure = () => procedure;

  export const createRouter = t.router;

  export const applyToHonoApp = ({
    honoApp,
    trpcRouter,
  }: {
    honoApp: HonoBackend.App;
    trpcRouter: TrpcRouter.Type;
  }) => {
    honoApp.use(
      "/trpc/*",
      trpcServer({
        router: trpcRouter,
        createContext: (_opts, c: HonoBackend.Context) => c.var as Context,
      })
    );
  };
}
