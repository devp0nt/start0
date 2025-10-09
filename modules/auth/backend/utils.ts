import { parseZod } from '@apps/shared/utils'
import type { AdminClientMe, MeAuthorized, MemberClientMe, UserClientMe } from '@auth/shared/utils'
import { zAdminClientMe, zMemberClientMe, zUserClientMe } from '@auth/shared/utils'
import { env } from '@backend/base/env.runtime'
import type { BackendCtx } from '@backend/core/ctx'
import type { HonoBase } from '@backend/core/hono'
import { backendAuthRoutesBasePath } from '@backend/shared/utils'
import { prisma } from '@prisma/backend/client'
import { getUser, toAdminClientAdmin, type Admin, type Member, type UserWithEverything } from '@user/admin/utils.be'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession, openAPI } from 'better-auth/plugins'
import generatePasswordTs from 'generate-password-ts'
import type { Context as HonoContext } from 'hono'
import { v4 as uuidv4 } from 'uuid'
import {
  adminPluginOptions,
  createHasPermission,
  createRequirePermission,
  createServerAdminPlugin,
} from '../shared/permissions'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    await createServerAdminPlugin(),
    openAPI(),
    customSession(async ({ user, session }) => {
      const me = await getMe({ prisma }, user.id)
      return {
        ...me,
        session,
      }
    }),
  ],
  basePath: backendAuthRoutesBasePath,
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (data) => ({
          data: { ...data, id: uuidv4() },
        }),
        after: async (data, ctx) => {
          await prisma.memberUser.create({
            data: {
              userId: data.id,
            },
          })
          if (adminPluginOptions.adminRoles.includes(data.role as string)) {
            await prisma.adminUser.create({
              data: {
                userId: data.id,
              },
            })
          }
        },
      },
    },
    session: {
      create: {
        before: async (data) => ({
          data: { ...data, id: uuidv4() },
        }),
      },
    },
    account: {
      create: {
        before: async (data) => ({
          data: { ...data, id: uuidv4() },
        }),
      },
    },
    verification: {
      create: {
        before: async (data) => ({
          data: { ...data, id: uuidv4() },
        }),
      },
    },
  },
  trustedOrigins: [env.ADMIN_URL, env.SITE_URL].flatMap((url) => url || []),
})

// path hardcoded by better-auth "open-api/generate-schema"
export const authOpenapiSchemaUrl = `${backendAuthRoutesBasePath}/open-api/generate-schema`

export const getAuthCtxByHonoContext = async (honoCtx: HonoContext) => {
  const session = await auth.api.getSession({ headers: honoCtx.req.raw.headers })
  return {
    admin: session?.admin || null,
    member: session?.member || null,
    session: session?.session || null,
    hasPermission: createHasPermission(session?.admin || session?.member || null),
    requirePermission: createRequirePermission(session?.admin || session?.member || null),
    auth,
  }
}
export type AuthCtx = Awaited<ReturnType<typeof getAuthCtxByHonoContext>>

export const applyAuthRoutesToHonoApp = ({ hono }: { hono: HonoBase }) => {
  hono.on(['POST', 'GET'], `${backendAuthRoutesBasePath}/*`, async (c) => await auth.handler(c.req.raw))
}

const getMe = async (ctx: Pick<BackendCtx, 'prisma'>, userId: string): Promise<MeAuthorized> => {
  const me = await getUser(ctx, userId)
  return {
    admin: !me.admin ? null : toAdminClientAdmin(me.admin),
    member: toMemberClientMe(me.member),
    user: toUserClientMe(me.user),
  }
}

export const generatePassword = () => {
  return generatePasswordTs.generate({
    length: 10,
    numbers: true,
    uppercase: true,
    lowercase: true,
    symbols: true,
    excludeSimilarCharacters: true,
    strict: true,
  })
}

export type Session = (typeof auth)['$Infer']['Session']['session']

export function toUserClientMe(data: UserWithEverything): UserClientMe
export function toUserClientMe(data: null): null
export function toUserClientMe(data: UserWithEverything | null): UserClientMe | null
export function toUserClientMe(data: UserWithEverything | null): UserClientMe | null {
  return !data ? null : parseZod(zUserClientMe, data)
}

export function toAdminClientMe(data: Admin): AdminClientMe
export function toAdminClientMe(data: null): null
export function toAdminClientMe(data: Admin | null): AdminClientMe | null
export function toAdminClientMe(data: Admin | null): AdminClientMe | null {
  return !data ? null : parseZod(zAdminClientMe, data)
}

export function toMemberClientMe(data: Member): MemberClientMe
export function toMemberClientMe(data: null): null
export function toMemberClientMe(data: Member | null): MemberClientMe | null
export function toMemberClientMe(data: Member | null): MemberClientMe | null {
  return !data ? null : parseZod(zMemberClientMe, data)
}
