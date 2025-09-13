import type { HonoReqCtx } from "@backend/core/lib/ctx.hono"
import { Error0 } from "@devp0nt/error0"
import { initTRPC } from "@trpc/server"
import superjson from "superjson"

export namespace BackendTrpc {
  export type TrpcCtx = { honoReqCtx: HonoReqCtx } & HonoReqCtx.Unextendable

  const t = initTRPC.context<TrpcCtx>().create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => {
      // TODO: use correct code from TRPC, or force error0 code
      const error0 = Error0.from(error.cause || error)
      return {
        ...shape,
        data: {
          ...shape.data,
          httpStatus: error0.httpStatus || shape.data.httpStatus,
          error0: error0.toJSON(),
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
    ctx.honoReqCtx.meta.assign({
      trpcReqPath: path,
      trpcReqType: type,
    })
    const { logger } = ctx.honoReqCtx.extend("trpc:req")
    const reqStartedAt = performance.now()
    const result = await next({ ctx })
    if (result.ok) {
      logger.info({
        message: "Successful trpc request",
        reqDurationMs: performance.now() - reqStartedAt,
      })
    } else {
      logger.error(result.error.cause || result.error, {
        message: "Failed trpc request",
        reqDurationMs: performance.now() - reqStartedAt,
      })
    }
    return result
  })

  export const baseProcedure = () => loggedProcedure
}
