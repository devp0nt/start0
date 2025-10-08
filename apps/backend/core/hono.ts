import { appName } from '@apps/shared/general'
import { getAuthCtxValueByHonoContext } from '@auth/backend/backend/utils'
import type { Permissions } from '@auth/shared/shared/permissions'
import type { BackendCtx } from '@backend/core/ctx'
import { toErrorResponseWithStatus } from '@backend/core/error'
import { Error0 } from '@devp0nt/error0'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import type { Context as HonoContext } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'

// base

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
export type HonoSettings<THonoReqCtx extends HonoReqCtx = HonoReqCtx> = {
  Variables: { honoReqCtx: THonoReqCtx } & Omit<THonoReqCtx, 'self'>
}
export type HonoCtx = HonoContext<HonoSettings>
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

export const applyHonoReqContext = ({ hono, backendCtx }: { hono: HonoBase; backendCtx: BackendCtx.Self }) => {
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

// admin

export type HonoAdminReqCtx = Omit<HonoReqCtx, 'admin' | 'user'> & {
  admin: NonNullable<HonoReqCtx['admin']>
  user: NonNullable<HonoReqCtx['user']>
}
export type HonoAdminBase = HonoBase<HonoAdminReqCtx>
export type HonoAdminBaseSettings = {
  permission?: Permissions
  permissions?: Permissions
}
const validateHonoAdminReqCtx = async (
  honoReqCtx: HonoReqCtx,
  settings?: HonoAdminBaseSettings,
): Promise<HonoAdminReqCtx> => {
  if (!honoReqCtx.user) {
    throw new Error0('Only for authorized admins', { expected: true, httpStatus: 403 })
  }
  if (!honoReqCtx.admin) {
    throw new Error0('Only for authorized admins', { expected: true, httpStatus: 403 })
  }
  if (settings?.permission) {
    honoReqCtx.requirePermission({ permission: settings.permission })
  }
  if (settings?.permissions) {
    honoReqCtx.requirePermission({ permissions: settings.permissions })
  }
  return honoReqCtx as never
}
export const honoAdminBase = (settings?: HonoAdminBaseSettings): HonoAdminBase => {
  const hono = honoBase<HonoAdminReqCtx>()
  hono.use(async (honoCtx, next) => {
    await validateHonoAdminReqCtx(honoCtx.var.honoReqCtx, settings)
    await next()
  })
  return hono
}

// member

export type HonoMemberReqCtx = Omit<HonoReqCtx, 'member' | 'user'> & {
  member: NonNullable<HonoReqCtx['member']>
  user: NonNullable<HonoReqCtx['user']>
}
export type HonoMemberBase = HonoBase<HonoMemberReqCtx>
const validateHonoMemberReqCtx = (honoReqCtx: HonoReqCtx): HonoMemberReqCtx => {
  if (!honoReqCtx.user) {
    throw new Error0('Only for authorized users', { expected: true, httpStatus: 403 })
  }
  if (!honoReqCtx.member) {
    throw new Error0('Only for authorized users', { expected: true, httpStatus: 403 })
  }
  return honoReqCtx as never
}
export const honoMemberBase = (): HonoMemberBase => {
  const hono = honoBase<HonoMemberReqCtx>()
  hono.use(async (honoCtx, next) => {
    validateHonoMemberReqCtx(honoCtx.var.honoReqCtx)
    await next()
  })
  return hono
}

// utils

export const applyHonoLogging = ({ hono }: { hono: HonoBase }) => {
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

export const applyHonoErrorHandling = ({ hono }: { hono: HonoBase }) => {
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
