import type { BackendCtx } from '@backend/core/lib/ctx'
import { Error0 } from '@devp0nt/error0'
import { OpenAPIHono } from '@hono/zod-openapi'
import type { Context as HonoContext } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'

export namespace HonoReqCtx {
  export const create = ({ backendCtx, honoCtx }: { backendCtx: BackendCtx.Self; honoCtx: HonoContext }) => {
    const req = honoCtx.req
    const connInfo = getConnInfo(honoCtx)
    // TODO: add more data to context about request, also uniq id of request
    const tri0 = backendCtx.tri0.extend('hono', {
      ip: connInfo.remote.address,
      userAgent: req.header('User-Agent'),
      reqMethod: req.method,
      reqPath: req.path,
    })
    return backendCtx.self.extend({
      tri0,
      honoCtx,
      req: honoCtx.req,
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
    return { honoApp }
  }

  export const applyContextSetter = ({ honoApp, backendCtx }: { honoApp: AppType; backendCtx: BackendCtx.Self }) => {
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
  }

  export const applyContextDestroyer = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.use(async (honoCtx, next) => {
      try {
        await next()
      } finally {
        await honoCtx.var.honoReqCtx.self.destroy()
      }
    })
  }

  export const applyLogging = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.use(async (c, next) => {
      const reqStartedAt = performance.now()
      try {
        await next()
      } finally {
        const { logger } = c.var.tri0.extend('req')
        logger.info({
          message: 'Hono request finished',
          reqDurationMs: performance.now() - reqStartedAt,
        })
      }
    })
  }

  export const applyErrorHandling = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.onError((error, c) => {
      try {
        const { logger } = c.var.tri0.extend('req')
        logger.error(error, {
          message: 'Hono request unhandled error',
        })
        return c.json(Error0.toJSON(error), 500)
      } catch (errorAgain) {
        // biome-ignore lint/suspicious/noConsole: <it is corner case when everything is broken>
        console.error(errorAgain, error)
        return c.json(Error0.toJSON(error), 500)
      }
    })
  }

  export type AppType = ReturnType<typeof create>['honoApp']
}
