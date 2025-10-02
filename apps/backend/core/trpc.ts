import type { HonoCtx } from '@backend/core/hono'
import { Error0 } from '@devp0nt/error0'
import { initTRPC } from '@trpc/server'
import superjson from 'superjson'

export const createTrpcCtx = (honoCtx: HonoCtx) => {
  return honoCtx.var.honoReqCtx.self
    .extend('trpc', {
      tri0: honoCtx.var.tri0.extend('trpc'),
    })
    .self.extractValue()
}
export type TrpcCtx = ReturnType<typeof createTrpcCtx>

const t = initTRPC.context<TrpcCtx>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    // TODO0: use correct code from TRPC, or force error0 code
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
export const createTrpcCallerFactory = t.createCallerFactory

// Utility for creating a tRPC router
export const createTrpcRouter = t.router

const trpcProcedure = t.procedure

const trpcLogged = trpcProcedure.use(async ({ ctx, next, path, type }) => {
  ctx.tri0.meta.assign({
    trpcReqPath: path,
    trpcReqType: type,
  })
  const { logger } = ctx.tri0.extend('req')
  const reqStartedAt = performance.now()
  const result = await next({ ctx })
  if (result.ok) {
    logger.info({
      message: 'Successful trpc request',
      reqDurationMs: performance.now() - reqStartedAt,
    })
  } else {
    logger.error(result.error.cause || result.error, {
      message: 'Failed trpc request',
      reqDurationMs: performance.now() - reqStartedAt,
    })
  }
  return result
})

export const trpcBase = () => trpcLogged
