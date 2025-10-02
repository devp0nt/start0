import { getAuthCtxValueByHonoContext } from '@auth/backend/utils.be'
import type { BackendCtx } from '@backend/core/ctx'
import { Error0 } from '@devp0nt/error0'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import type { Context as HonoContext } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'

export namespace HonoReqCtx {
  export const create = async ({ backendCtx, honoCtx }: { backendCtx: BackendCtx.Self; honoCtx: HonoContext }) => {
    const req = honoCtx.req
    const connInfo = getConnInfo(honoCtx)
    // TODO0: add more data to context about request, also uniq id of request
    const tri0 = backendCtx.tri0.extend('hono', {
      ip: connInfo.remote.address,
      userAgent: req.header('User-Agent'),
      reqMethod: req.method,
      reqPath: req.path,
    })
    const authCtxValue = await getAuthCtxValueByHonoContext(honoCtx)
    return backendCtx.self.extend({
      tri0,
      honoCtx,
      req: honoCtx.req,
      ...authCtxValue,
    })
  }

  export type Self = Awaited<ReturnType<typeof create>>
  export type Value = Omit<Self, 'self'>
}

export namespace HonoApp {
  type HonoInit = {
    Variables: { honoReqCtx: HonoReqCtx.Self } & HonoReqCtx.Value
  }
  export type HonoCtx = HonoContext<HonoInit>

  export const create = () => {
    const honoApp = new OpenAPIHono<HonoInit>({
      defaultHook: (result, c) => {
        if (!result.success) {
          return c.json({ error: Error0.toJSON(result.error) }, 422)
        }
      },
    })
    return honoApp
  }

  export const createChild = ({ path, honoApp }: { path: string; honoApp: AppType }) => {
    const childHonoApp = create()
    honoApp.route(path, childHonoApp)
    return childHonoApp
  }

  export const applyContext = ({ honoApp, backendCtx }: { honoApp: AppType; backendCtx: BackendCtx.Self }) => {
    honoApp.use(async (honoCtx, next) => {
      const honoReqCtx = await HonoReqCtx.create({
        backendCtx,
        honoCtx,
      })
      honoCtx.set('honoReqCtx', honoReqCtx)
      honoReqCtx.self.forEach((key, value) => {
        honoCtx.set(key as never, value as never)
      })
      try {
        await next()
      } finally {
        await honoReqCtx.self.destroy()
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
        const error0 = Error0.from(error)
        return c.json(
          {
            error: error0.toJSON(),
          },
          (error0.httpStatus as any) || 500,
        )
      } catch (errorAgain) {
        // eslint-disable-next-line no-console -- it is corner case when everything is broken
        console.error(errorAgain, error)
        const error0 = Error0.from(errorAgain)
        return c.json(
          {
            error: error0.toJSON(),
          },
          // TODO0: fix it in error0
          (error0.httpStatus as any) || 500,
        )
      }
    })
  }

  export const applyOpenapiDocs = ({
    honoApp,
    basePath,
    ctx,
  }: {
    honoApp: AppType
    basePath?: string
    ctx: BackendCtx.Self
  }) => {
    honoApp.doc31(
      '/doc.json',
      {
        openapi: '3.1.0',
        info: { title: 'AdminHub', version: '1' },
        ...(basePath ? { servers: [{ url: basePath }] } : {}),
      },
      { unionPreferredType: 'oneOf' },
    )
  }

  export const applySwaggerDocs = ({ honoApp, basePath = '' }: { honoApp: AppType; basePath?: string }) => {
    honoApp.get('/doc/swagger', swaggerUI({ url: basePath + '/doc.json' }))
  }

  export const applySaturnDocs = ({ honoApp, basePath = '' }: { honoApp: AppType; basePath?: string }) => {
    honoApp.get('/doc/scalar', Scalar({ url: basePath + '/doc.json' }))
  }

  export type AppType = ReturnType<typeof create>
}
