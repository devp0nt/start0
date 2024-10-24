import type { TrpcRouter } from '@/backend/src/router/trpc/index.js'
import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { throwOnDangerServerOnlyProperty } from '@/backend/src/services/other/dangerServerOnlyProperty.js'
import { logger } from '@/backend/src/services/other/logger.js'
import type { ExpressResponse, ExpressRequest } from '@/backend/src/types/other.js'
import { includesAdminWithEverything } from '@/general/src/admin/utils.server.js'
import { hasPermissionAsAdmin } from '@/general/src/auth/can.js'
import { signOut } from '@/general/src/auth/utils.server.js'
import { ErroryExpected, toErrory } from '@/general/src/other/errory.js'
import { includesUserWithEverything } from '@/general/src/user/utils.server.js'
import type { AdminPermission } from '@prisma/client'
import { createServerSideHelpers } from '@trpc/react-query/server'
import { initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import type { Express } from 'express'
import superjson from 'superjson'

export const getTrpcContext = ({
  appContext,
  req,
  res,
}: {
  appContext: AppContext
  req: ExpressRequest
  res: ExpressResponse
}) => {
  return {
    ...appContext,
    me: req.me,
    clientData: req.clientData,
    req,
    res,
  }
}

const getCreateTrpcContext =
  (appContext: AppContext) =>
  ({ req, res }: trpcExpress.CreateExpressContextOptions) =>
    getTrpcContext({ appContext, req: req as ExpressRequest, res: res as ExpressResponse })

export type TrpcContext = ReturnType<Awaited<ReturnType<typeof getCreateTrpcContext>>>

const trpc = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        ...toErrory(error.cause),
        message: error.cause?.message,
      },
    }
  },
})

export const getCreateTrpcSSH =
  ({ trpcRouter }: { trpcRouter: TrpcRouter }) =>
  ({ req, res, appContext }: { req: ExpressRequest; res: ExpressResponse; appContext: AppContext }) => {
    return createServerSideHelpers({
      transformer: superjson,
      router: trpcRouter,
      ctx: getTrpcContext({
        appContext,
        req,
        res,
      }),
    })
  }
export type TrpcSSH = ReturnType<ReturnType<typeof getCreateTrpcSSH>>

export const createTrpcRouter = trpc.router
export const createTrpcCallerFactory = trpc.createCallerFactory

const trpcLoggedProcedure = trpc.procedure.use(
  trpc.middleware(async ({ path, type, next, ctx }) => {
    const start = Date.now()
    if (ctx.env.isTestNodeEnv()) {
      ctx.me.admin =
        ctx.me.admin &&
        (await ctx.prisma.admin.findUniqueOrThrow({
          where: { id: ctx.me.admin.id },
          include: includesAdminWithEverything,
        }))
      ctx.me.user =
        ctx.me.user &&
        (await ctx.prisma.user.findUniqueOrThrow({
          where: { id: ctx.me.user.id },
          include: includesUserWithEverything,
        }))
    }
    const result = await next({
      ctx,
    })
    const durationMs = Date.now() - start
    const meta = {
      path,
      type,
      adminId: ctx.me.admin?.id || null,
      userId: ctx.me.user?.id || null,
      ip: ctx.clientData.ip || null,
      durationMs,
      // rawInput: (await getRawInput()) || null,
    }
    if (result.ok) {
      throwOnDangerServerOnlyProperty(result.data)
      // logger.info(`trpc:${type}:success`, 'Successfull request', { ...meta, output: result.data })
      logger.info({ tag: `trpc:${type}`, message: 'Successfull request', meta })
    } else {
      logger.error({ tag: `trpc:${type}`, error: result.error, meta })
      if (result.error.message.includes('Transaction failed due to a write conflict or a deadlock')) {
        result.error.message = 'Server overloaded, please try again later'
      }
    }
    return result
  })
)

export const trpcBaseProcedure = () =>
  trpcLoggedProcedure.use(
    trpc.middleware(async ({ next, ctx }) => {
      const { admin } = ctx.me
      if (admin?.bannedAt) {
        signOut({ ctx, role: 'admin' })
        throw new ErroryExpected('Your account is banned, contact administration')
      }
      const { user } = ctx.me
      if (user?.bannedAt) {
        signOut({ ctx, role: 'user' })
        throw new ErroryExpected('Your account is banned, contact administration')
      }
      return await next()
    })
  )

export const trpcAuthorizedProcedure = () => trpcBaseProcedure

export const trpcAuthorizedAdminProcedure = (props?: { permission?: AdminPermission }) =>
  trpcBaseProcedure().use(
    trpc.middleware(async ({ next, ctx }) => {
      const { admin } = ctx.me
      if (!admin) {
        throw new ErroryExpected('Admins only')
      }
      if (admin.bannedAt) {
        signOut({ ctx, role: 'admin' })
        throw new ErroryExpected('Your account is banned, contact administration')
      }
      const permission = props?.permission
      if (permission && !hasPermissionAsAdmin(admin, permission)) {
        throw new ErroryExpected('You are not allowed to do this')
      }
      return await next({
        ctx: {
          ...ctx,
          me: {
            ...ctx.me,
            admin,
          },
        },
      })
    })
  )

export const trpcAuthorizedUserProcedure = () =>
  trpcBaseProcedure().use(
    trpc.middleware(async ({ next, ctx }) => {
      const { user } = ctx.me
      if (!user) {
        throw new ErroryExpected('Authorized users only')
      }
      if (user.bannedAt) {
        signOut({ ctx, role: 'user' })
        throw new ErroryExpected('Your account is banned, contact administration')
      }
      return await next({
        ctx: {
          ...ctx,
          me: {
            ...ctx.me,
            user,
          },
        },
      })
    })
  )

export const applyTrpcToExpressApp = ({
  expressApp,
  appContext,
  trpcRouter,
}: {
  expressApp: Express
  appContext: AppContext
  trpcRouter: TrpcRouter
}) => {
  expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext: getCreateTrpcContext(appContext),
    })
  )
}
