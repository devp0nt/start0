import { appName } from '@apps/shared/utils'
import { getAuthCtxValueByHonoContext } from '@auth/backend/utils.be'
import type { BackendCtx } from '@backend/core/ctx'
import { toErrorResponseWithStatus } from '@backend/core/error'
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
        return c.json(...toErrorResponseWithStatus(result.error, 422))
      }
    },
  })
  return hono
}
export type Hono0 = ReturnType<typeof honoBase>

export const honoAdminBase = () => {
  return honoBase()
}
export const honoAppBase = () => {
  return honoBase()
}

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
      return c.json(...toErrorResponseWithStatus(error))
    } catch (errorAgain) {
      // eslint-disable-next-line no-console -- it is corner case when everything is broken
      console.error(errorAgain, error)
      return c.json(...toErrorResponseWithStatus(errorAgain))
    }
  })
}

export const applyHonoOpenapiDocs = ({ hono, basePath, name }: { hono: Hono0; basePath?: string; name: string }) => {
  hono.doc31(
    '/doc.json',
    {
      openapi: '3.1.0',
      info: { title: `${appName} ${name}`, version: '1' },
      ...(basePath ? { servers: [{ url: basePath }] } : {}),
    },
    { unionPreferredType: 'oneOf' },
  )
}

export const applyScalarDocs = ({
  hono,
  path,
  sources,
}: {
  hono: Hono0
  path: `/${string}`
  sources: Array<
    (
      | {
          basePath: string
        }
      | {
          path: string
        }
    ) & {
      title: string
    }
  >
}) => {
  hono.get(
    path,
    Scalar({
      sources: sources.map((source) => ({
        url: 'path' in source ? source.path : source.basePath + '/doc.json',
        title: source.title,
      })),
    }),
  )
}
