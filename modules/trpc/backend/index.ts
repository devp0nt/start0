import {
  validateHonoAdminReqCtx,
  validateHonoCustomerReqCtx,
  type HonoAdminOptions,
  type HonoReqCtx,
} from '@hono/backend'
import type { Ctx0 } from '@devp0nt/ctx0'
import { Error0 } from '@devp0nt/error0'
import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { OpenApiMeta } from 'trpc-to-openapi'

export type TrpcCtx<THonoReqCtx extends HonoReqCtx = HonoReqCtx> = Ctx0.InferValue<THonoReqCtx> & {
  honoReqCtx: THonoReqCtx
}
export const createTrpcCtx = <THonoReqCtx extends HonoReqCtx = HonoReqCtx>(
  honoReqCtx: THonoReqCtx,
): TrpcCtx<THonoReqCtx> => {
  const honoReqCtxValue = honoReqCtx.self.extractValue()
  return { ...honoReqCtxValue, honoReqCtx } as TrpcCtx<THonoReqCtx>
}

const t = initTRPC
  .context<TrpcCtx>()
  .meta<OpenApiMeta>()
  .create({
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
  const { logger } = ctx.tri0.extend('trpc:req')
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

export const trpcAdminBase = (options?: HonoAdminOptions) => {
  return trpcLogged.use(async ({ ctx, next, path, type }) => {
    const honoAdminReqCtx = await validateHonoAdminReqCtx(ctx.honoReqCtx, options)
    const trpcAdminReqCtx = createTrpcCtx(honoAdminReqCtx)
    return await next({ ctx: trpcAdminReqCtx })
  })
}

export const trpcCustomerBase = () => {
  return trpcLogged.use(async ({ ctx, next, path, type }) => {
    const honoCustomerReqCtx = await validateHonoCustomerReqCtx(ctx.honoReqCtx)
    const trpcCustomerReqCtx = createTrpcCtx(honoCustomerReqCtx)
    return await next({ ctx: trpcCustomerReqCtx })
  })
}
