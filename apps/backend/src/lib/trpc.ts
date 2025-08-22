import { trpcServer } from "@hono/trpc-server"
import type { HonoApp } from "@shmoject/backend/lib/hono"
import type { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc"
import { Error0 } from "@shmoject/modules/lib/error0"
import { initTRPC } from "@trpc/server"
import superjson from "superjson"

export namespace BackendTrpc {
  export type TrpcCtx = HonoApp.ReqCtx

  const t = initTRPC.context<TrpcCtx>().create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => {
      // TODO: use correct code from TRPC, or force error0 code
      const error0 = Error0.from(error.cause || error)
      const httpStatus = error0.httpStatus || shape.data.httpStatus
      const error0Fixed = Error0.from(error0, {
        httpStatus,
      })
      const error0FixedJson = error0Fixed.toJSON()
      return {
        ...shape,
        message: JSON.stringify(error0FixedJson),
        data: {
          ...shape.data,
          httpStatus,
          originalMessage: shape.message,
          error0: error0FixedJson,
        },
      }
    },
  })

  // Create a caller factory for making server-side tRPC calls from loaders or actions.
  export const createCallerFactory = t.createCallerFactory

  // Utility for creating a tRPC router
  export const createTRPCRouter = t.router

  const procedure = t.procedure

  const loggedProcedure = procedure.use(async ({ ctx, next, path, type }) => {
    const reqStartedAt = performance.now()
    const l = ctx.logger.getChild("req")
    l.meta.assign({
      trpcReqPath: path,
      trpcReqType: type,
    })
    l.info({
      message: "Trpc request started",
    })
    const result = await next({ ctx })
    if (result.ok) {
      l.info({
        message: "Trpc request finished with success",
        reqDurationMs: performance.now() - reqStartedAt,
      })
    } else {
      l.error(result.error.cause || result.error, {
        message: "Trpc request finished with error",
        reqDurationMs: performance.now() - reqStartedAt,
      })
    }
    return result
  })

  export const baseProcedure = () => loggedProcedure

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
        createContext: (_opts, c: HonoApp.HonoCtx) => {
          return {
            ...c.var,
            logger: c.var.logger.getChild("trpc"),
          } as TrpcCtx
        },
      }),
    )
  }
}
