import { appName } from '@apps/shared/utils'
import { authOpenapiSchemaUrl, getAuthCtxValueByHonoContext } from '@auth/backend/utils.be'
import type { BackendCtx } from '@backend/core/ctx'
import { Error0 } from '@devp0nt/error0'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import type { Context as HonoContext } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'

const createHonoReqCtx = async ({ backendCtx, honoCtx }: { backendCtx: BackendCtx.Self; honoCtx: HonoContext }) => {
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

export type HonoReqCtx = Awaited<ReturnType<typeof createHonoReqCtx>>
export type HonoReqCtxValue = Omit<HonoReqCtx, 'self'>

type HonoInit = {
  Variables: { honoReqCtx: HonoReqCtx } & HonoReqCtxValue
}
export type HonoCtx = HonoContext<HonoInit>

export const honoBase = () => {
  const hono = new OpenAPIHono<HonoInit>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json({ error: Error0.toJSON(result.error) }, 422)
      }
    },
  })
  return hono
}
export type Hono0 = ReturnType<typeof honoBase>

export const applyHonoReqContext = ({ hono, backendCtx }: { hono: Hono0; backendCtx: BackendCtx.Self }) => {
  hono.use(async (honoCtx, next) => {
    const honoReqCtx = await createHonoReqCtx({
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

export const applyHonoLogging = ({ hono }: { hono: Hono0 }) => {
  hono.use(async (c, next) => {
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

export const applyHonoErrorHandling = ({ hono }: { hono: Hono0 }) => {
  hono.onError((error, c) => {
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

export const applyHonoOpenapiDocs = ({
  hono,
  basePath,
  backendCtx,
  name,
  scalar = true,
}: {
  hono: Hono0
  basePath?: string
  backendCtx: BackendCtx.Self
  name: string
  scalar?: boolean
}) => {
  hono.doc31(
    '/doc.json',
    {
      openapi: '3.1.0',
      info: { title: `${appName} ${name}`, version: '1' },
      ...(basePath ? { servers: [{ url: basePath }] } : {}),
    },
    { unionPreferredType: 'oneOf' },
  )

  if (scalar) {
    hono.get(
      '/doc/scalar',
      Scalar({
        sources: [
          {
            url: basePath + '/doc.json',
            title: `${appName} ${name}`,
          },
          {
            url: authOpenapiSchemaUrl,
            title: `${appName} Auth`,
          },
        ],
      }),
    )
  }
}
