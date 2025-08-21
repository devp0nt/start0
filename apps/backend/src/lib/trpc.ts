import { trpcServer } from "@hono/trpc-server"
import type { HonoApp } from "@shmoject/backend/lib/hono"
import type { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc"
import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import z from "zod"

export namespace BackendTrpc {
  export type Context = HonoApp.ContextVariables

  const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => ({
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof z.ZodError
            ? z.flattenError(error.cause)
            : null,
      },
    }),
  })

  // Create a caller factory for making server-side tRPC calls from loaders or actions.
  export const createCallerFactory = t.createCallerFactory

  // Utility for creating a tRPC router
  export const createTRPCRouter = t.router

  const procedure = t.procedure

  export const baseProcedure = () => procedure

  export const applyToHonoApp = ({
    honoApp,
    trpcRouter,
  }: {
    honoApp: HonoApp.AppType
    trpcRouter: BackendTrpcRouter.TrpcRouter
  }) => {
    honoApp.use(
      "/trpc/*",
      trpcServer({
        router: trpcRouter,
        createContext: (_opts, c: HonoApp.Context) => c.var as Context,
      }),
    )
  }
}
