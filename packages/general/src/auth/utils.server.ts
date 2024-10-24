import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { getOneEnv } from '@/backend/src/services/other/env.js'
import type { TrpcContext } from '@/backend/src/services/other/trpc.js'
import { includesAdminWithEverything } from '@/general/src/admin/utils.server.js'
import { includesUserWithEverything } from '@/general/src/user/utils.server.js'
import crypto from 'crypto'
import type { Express } from 'express'
import jwt from 'jsonwebtoken'
import { pick } from 'svag-utils'
import z from 'zod'

const jwtSecret = getOneEnv('JWT_SECRET')
const passwordSalt = getOneEnv('PASSWORD_SALT')
export const signJwtAny = (jwtPayload: any, jwtExpiresIn = '7d') => {
  const normalizedPayload = normalizeJwtAuthPayload(jwtPayload)
  return jwt.sign(normalizedPayload, jwtSecret, {
    ...(jwtExpiresIn
      ? {
          expiresIn: jwtExpiresIn,
        }
      : {}),
  })
}
export const signJwtAuth = (jwtPayload: JwtAuthPayload, jwtExpiresIn?: string) => {
  return signJwtAny(jwtPayload, jwtExpiresIn)
}
export const getPasswordHash = (password: string) => {
  return crypto.createHash('sha256').update(`${passwordSalt}${password}`).digest('hex')
}
const normalizeJwtAuthPayload = (rawJwtPayload: any) => {
  const zSchema = z
    .object({
      user: z
        .object({
          authTokenSource: z.string(),
        })
        .nullable()
        .default(null),
      admin: z
        .object({
          authTokenSource: z.string(),
        })
        .nullable()
        .default(null),
    })
    .default({})
  try {
    return zSchema.parse(rawJwtPayload)
  } catch {
    return zSchema.parse({} as z.input<typeof zSchema>)
  }
}
type JwtAuthPayload = ReturnType<typeof normalizeJwtAuthPayload>
const getMeFromJwtAuthPayload = async (jwtPayload: JwtAuthPayload, ctx: AppContext) => {
  const user = jwtPayload.user
    ? await ctx.prisma.user.findUnique({
        where: { authTokenSource: jwtPayload.user.authTokenSource },
        include: includesUserWithEverything,
      })
    : null
  const admin = jwtPayload.admin
    ? await ctx.prisma.admin.findUnique({
        where: { authTokenSource: jwtPayload.admin.authTokenSource },
        include: includesAdminWithEverything,
      })
    : null
  return {
    jwtPayload,
    user,
    admin,
  }
}

const parseJwtAuth = async (token: string) => {
  return await new Promise<JwtAuthPayload>((resolve, reject) => {
    jwt.verify(token, jwtSecret, (error, decoded) => {
      try {
        if (error) {
          resolve(normalizeJwtAuthPayload(undefined))
        } else {
          resolve(normalizeJwtAuthPayload(decoded))
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(error)
      }
    })
  })
}

export const applyAuthToExpressApp = ({ expressApp, ctx }: { expressApp: Express; ctx: AppContext }): void => {
  expressApp.use((req: any, res: any, next: any) => {
    const tokenFromBearer = req.headers?.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined
    const tokenFromCookies = tokenCookieName ? req.cookies[tokenCookieName] : undefined
    const tokenFromGetter = getTokenFromRequest ? getTokenFromRequest(req) : undefined
    const token = tokenFromGetter || tokenFromBearer || tokenFromCookies
    void (async () => {
      try {
        const jwtPayload = token ? await parseJwtAuth(token) : normalizeJwtAuthPayload(undefined)
        const meFromJwtPayload = await getMeFromJwtAuthPayload(jwtPayload, ctx)
        req.me = meFromJwtPayload
        next()
      } catch (error) {
        next(error)
      }
    })()
  })
}

const tokenCookieName: string | undefined = undefined
const getTokenFromRequest: undefined | ((req: Record<string, any>) => string | undefined) = (req) => {
  return req.cookies['svagatron-token']
}

export type MeServer = Awaited<ReturnType<typeof getMeFromJwtAuthPayload>>
export type ExpressRequestWithMe = {
  me: MeServer
}

export const toClientMe = (me: MeServer) => {
  return {
    user: me.user && {
      ...pick(me.user, ['id', 'sn', 'permissions', 'createdAt', 'name', 'email', 'bannedAt', 'banReason']),
    },
    admin: me.admin && {
      ...pick(me.admin, ['id', 'sn', 'permissions', 'createdAt', 'name', 'email', 'banReason', 'bannedAt']),
    },
  }
}

export const signOut = ({ ctx, role }: { ctx: TrpcContext; role: 'user' | 'admin' }) => {
  const newJwtPayload = {
    ...ctx.me.jwtPayload,
    ...(role === 'user' && {
      user: null,
    }),
    ...(role === 'admin' && {
      admin: null,
    }),
  }
  const token = !newJwtPayload.user && !newJwtPayload.admin ? '' : signJwtAuth(newJwtPayload)
  ctx.res.cookie('svagatron-token', token, { maxAge: 9_000_000_000, httpOnly: true, secure: true, sameSite: 'strict' })
  return { token }
}
