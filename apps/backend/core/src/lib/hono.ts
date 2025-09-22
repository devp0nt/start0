import type { BackendCtx } from '@backend/core/lib/ctx'
import { Error0 } from '@devp0nt/error0'
import { OpenAPIHono } from '@hono/zod-openapi'
import type { Context as HonoContext } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'

export namespace HonoReqCtx {
  export const create = ({ backendCtx, honoCtx }: { backendCtx: BackendCtx.Self; honoCtx: HonoContext }) => {
    return backendCtx.self.extend(() => {
      const req = honoCtx.req
      const connInfo = getConnInfo(honoCtx)
      const tri0 = backendCtx.tri0.extend('hono', {
        ip: connInfo.remote.address,
        userAgent: req.header('User-Agent'),
        reqMethod: req.method,
        reqPath: req.path,
      })
      return {
        tri0,
        honoCtx,
        req: honoCtx.req,
      }
    })
  }

  export type Self = ReturnType<typeof create>
  export type Value = Omit<Self, 'self'>
}

export namespace HonoApp {
  type HonoContextSettings = {
    Variables: { honoReqCtx: HonoReqCtx.Self } & HonoReqCtx.Value
  }
  export type HonoCtx = HonoContext<HonoContextSettings>

  export const create = ({ backendCtx }: { backendCtx: BackendCtx.Self }) => {
    const honoApp = new OpenAPIHono<HonoContextSettings>()
    honoApp.use(async (honoCtx, next) => {
      const honoReqCtx = await HonoReqCtx.create({
        backendCtx,
        honoCtx,
      })
      honoCtx.set('honoReqCtx', honoReqCtx)
      honoReqCtx.self.forEach((key, value) => {
        honoCtx.set(key as never, value as never)
      })
      await next()
    })

    return { honoApp }
  }

  export const applyLogging = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.use(async (c, next) => {
      if (c.req.path.startsWith('/trpc')) {
        await next()
        return
      }
      const { logger } = c.var.tri0.extend('hono:req')
      const reqStartedAt = performance.now()
      try {
        await next()
        logger.info({
          message: 'Hono request finished with success',
          reqDurationMs: performance.now() - reqStartedAt,
        })
      } catch (error) {
        logger.error(error, {
          message: 'Hono request finished with error',
          reqDurationMs: performance.now() - reqStartedAt,
        })
        throw error
      }
    })
  }

  export const applyErrorHandling = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.onError((error, c) => {
      return c.json(Error0.toJSON(error), 500)
    })
  }

  export type AppType = ReturnType<typeof create>['honoApp']
}
