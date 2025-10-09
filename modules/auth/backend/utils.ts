import type { HonoBase } from '@backend/core/hono'
import { backendAuthRoutesBasePath } from '@backend/shared/utils'
import { prisma } from '@prisma/backend/client'
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
import { toMeAdmin, toMeMember } from '../shared/utils'
import { env } from '@backend/base/env.runtime'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    await createServerAdminPlugin(),
    openAPI(),
    customSession(async ({ user, session }) => {
      const userData = await getMe(user.id)
      return {
        ...userData,
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

export const getMe = async (userId: string) => {
  const { adminUser, memberUser, ...user } = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      adminUser: {
        include: {
          user: true,
        },
      },
      memberUser: {
        include: {
          user: true,
        },
      },
    },
  })
  const ensureMemberUser = await (async () => {
    if (memberUser) {
      return memberUser
    }
    return await prisma.memberUser.create({
      data: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    })
  })()
  const ensureAdminUser = await (async () => {
    if (!adminPluginOptions.adminRoles.includes(user.role)) {
      return null
    }
    if (adminUser) {
      return adminUser
    }
    return await prisma.adminUser.create({
      data: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    })
  })()
  return {
    admin: toMeAdmin(ensureAdminUser),
    member: toMeMember(ensureMemberUser),
  }
}
export type UserData = Awaited<ReturnType<typeof getMe>>

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
