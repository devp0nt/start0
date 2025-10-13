import { appName } from '@apps/base/general'
import { getAuthCtxByHonoCtx, type AuthCtx } from '@auth/backend/utils'
import type { Permissions } from '@auth/shared/permissions'
import type { Tri0 } from '@backend/base/tri0'
import type { BackendCtx, BackendCtxValue } from '@backend/ctx'
import { toErrorResponseWithStatus } from '@backend/base/error'
import type { Ctx0 } from '@devp0nt/ctx0'
import { Error0 } from '@devp0nt/error0'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import type { Context as HonoContext, MiddlewareHandler } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'

// base

export type HonoReqCtx = Ctx0.Proxy<
  {
    tri0: Tri0
    honoCtx: HonoContext
  } & AuthCtx,
  BackendCtxValue,
  null
>
export type HonoReqCtxValue = Ctx0.InferValue<HonoReqCtx>

const createHonoReqCtx = async ({
  backendCtx,
  honoCtx,
}: {
  backendCtx: BackendCtx
  honoCtx: HonoContext
}): Promise<HonoReqCtx> => {
  const req = honoCtx.req
  const connInfo = getConnInfo(honoCtx)
  const tri0 = backendCtx.tri0.extend({
    ip: connInfo.remote.address,
    userAgent: req.header('User-Agent'),
    reqMethod: req.method,
    reqPath: req.path,
  })
  // early set tri0, to have access to logger if something went wrong in auth middleware
  honoCtx.set('tri0', tri0)
  const authCtx = await getAuthCtxByHonoCtx(honoCtx)
  tri0.meta.assign({
    adminId: authCtx.admin?.id,
    customerId: authCtx.customer?.id,
  })
  return backendCtx.self.extend({
    tri0,
    honoCtx,
    ...authCtx,
  })
}

export type HonoSettings<THonoReqCtx extends HonoReqCtx = HonoReqCtx> = {
  Variables: { honoReqCtx: THonoReqCtx } & HonoReqCtxValue
}
export type HonoCtx<THonoReqCtx extends HonoReqCtx = HonoReqCtx> = HonoContext<HonoSettings<THonoReqCtx>>
export type HonoBase<THonoReqCtx extends HonoReqCtx = HonoReqCtx> = OpenAPIHono<HonoSettings<THonoReqCtx>>

export const honoBase = <THonoReqCtx extends HonoReqCtx = HonoReqCtx>(): HonoBase<THonoReqCtx> => {
  const hono = new OpenAPIHono<HonoSettings<THonoReqCtx>>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(...toErrorResponseWithStatus(result.error, 422))
      }
    },
  })
  return hono
}

export const applyHonoReqContext = ({ hono, backendCtx }: { hono: HonoBase; backendCtx: BackendCtx }) => {
  hono.use(async (honoCtx, next) => {
    const honoReqCtx = await createHonoReqCtx({
      backendCtx,
      honoCtx,
    })
    honoCtx.set('honoReqCtx', honoReqCtx)
    honoReqCtx.self.forEach((item) => {
      honoCtx.set(item.key, item.value)
    })
    try {
      await next()
    } finally {
      await honoReqCtx.self.destroy()
    }
  })
}

// admin

export type HonoAdminReqCtx = Ctx0.OverrideProxy<HonoReqCtx, { admin: NonNullable<HonoReqCtx['admin']> }>
export type HonoAdminSettings = HonoSettings<HonoAdminReqCtx>
export type HonoAdminBase = HonoBase<HonoAdminReqCtx>
export type HonoAdminOptions = {
  permission?: Permissions
  permissions?: Permissions
}
export const validateHonoAdminReqCtx = async (
  honoReqCtx: HonoReqCtx,
  options?: HonoAdminOptions,
): Promise<HonoAdminReqCtx> => {
  if (!honoReqCtx.admin) {
    throw new Error0('Only for authorized admins', { expected: true, httpStatus: 403 })
  }
  if (options?.permission) {
    honoReqCtx.requirePermission({ permission: options.permission })
  }
  if (options?.permissions) {
    honoReqCtx.requirePermission({ permissions: options.permissions })
  }
  return honoReqCtx as never
}
export const honoAdminMiddleware = (options?: HonoAdminOptions): MiddlewareHandler<HonoAdminSettings> => {
  return async (honoCtx, next) => {
    await validateHonoAdminReqCtx(honoCtx.var.honoReqCtx, options)
    await next()
  }
}
export const honoAdminBase = (options?: HonoAdminOptions): HonoAdminBase => {
  const hono = honoBase<HonoAdminReqCtx>()
  hono.use(honoAdminMiddleware(options))
  return hono
}

// customer

export type HonoCustomerReqCtx = Ctx0.OverrideProxy<HonoReqCtx, { customer: NonNullable<HonoReqCtx['customer']> }>
export type HonoCustomerSettings = HonoSettings<HonoCustomerReqCtx>
export type HonoCustomerBase = HonoBase<HonoCustomerReqCtx>
export const validateHonoCustomerReqCtx = async (honoReqCtx: HonoReqCtx): Promise<HonoCustomerReqCtx> => {
  if (!honoReqCtx.customer) {
    throw new Error0('Only for authorized users', { expected: true, httpStatus: 403 })
  }
  return honoReqCtx as never
}
export const honoCustomerMiddleware = (): MiddlewareHandler<HonoCustomerSettings> => {
  return async (honoCtx, next) => {
    await validateHonoCustomerReqCtx(honoCtx.var.honoReqCtx)
    await next()
  }
}
export const honoCustomerBase = (): HonoCustomerBase => {
  const hono = honoBase<HonoCustomerReqCtx>()
  hono.use(honoCustomerMiddleware())
  return hono
}

// all ctxs
export type HonoAnyReqCtx = HonoReqCtx | HonoAdminReqCtx | HonoCustomerReqCtx

// utils

export const applyHonoLogging = ({ hono }: { hono: HonoBase }) => {
  hono.use(async (c, next) => {
    const reqStartedAt = performance.now()
    try {
      await next()
    } finally {
      const { logger } = c.var.tri0.extend('hono:req')
      logger.info({
        message: 'Hono request finished',
        reqDurationMs: performance.now() - reqStartedAt,
      })
    }
  })
}

export const applyHonoErrorHandling = ({ hono }: { hono: HonoBase }) => {
  hono.onError((error, c) => {
    try {
      const { logger } = c.var.tri0.extend('hono:req')
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

export const applyHonoOpenapiDocs = ({ hono, basePath, name }: { hono: HonoBase; basePath?: string; name: string }) => {
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
  hono: HonoBase
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
