import { parseZodOrNull } from '@apps/shared/utils'
import type { HonoBase } from '@backend/core/hono'
import { backendAuthRoutesBasePath } from '@backend/shared/utils'
import { PrismaClient } from '@prisma0/backend/generated/prisma/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession, openAPI } from 'better-auth/plugins'
import type { Context as HonoContext } from 'hono'
import { v4 as uuidv4 } from 'uuid'
import { zMeAdmin, zMeMember, zMeUser } from '../shared/dto'
import {
  adminPluginOptions,
  createHasPermission,
  createRequirePermission,
  createServerAdminPlugin,
} from '../shared/permissions'

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    await createServerAdminPlugin(),
    openAPI(),
    customSession(async ({ user, session }) => {
      const userData = await getUserData(user.id)
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
  trustedOrigins: [process.env.ADMIN_URL, process.env.SITE_URL].flatMap((url) => url || []),
})

// path hardcoded by better-auth "open-api/generate-schema"
export const authOpenapiSchemaUrl = `${backendAuthRoutesBasePath}/open-api/generate-schema`

export const getAuthCtxByHonoContext = async (honoCtx: HonoContext) => {
  const session = await auth.api.getSession({ headers: honoCtx.req.raw.headers })
  return {
    user: session?.user || null,
    admin: session?.admin || null,
    member: session?.member || null,
    session: session?.session || null,
    hasPermission: createHasPermission(session?.user || null),
    requirePermission: createRequirePermission(session?.user || null),
    auth,
  }
}
export type AuthCtx = Awaited<ReturnType<typeof getAuthCtxByHonoContext>>

export const applyAuthRoutesToHonoApp = ({ hono }: { hono: HonoBase }) => {
  hono.on(['POST', 'GET'], `${backendAuthRoutesBasePath}/*`, async (c) => await auth.handler(c.req.raw))
}

export const getUserData = async (userId: string) => {
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
    user: parseZodOrNull(zMeUser, user),
    admin: parseZodOrNull(zMeAdmin, ensureAdminUser),
    member: parseZodOrNull(zMeMember, ensureMemberUser),
  }
}
export type UserData = Awaited<ReturnType<typeof getUserData>>
