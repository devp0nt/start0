import { getUser, toAdminClientAdmin, toCustomerClientMe, toUserClientMe } from '@auth/backend/user'
import { env } from '@backend/base/env.runtime'
import type { BackendCtx } from '@backend/core/ctx'
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
import type { MeAuthorized } from '@auth/shared/user'

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
          await prisma.customerUser.create({
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
    customer: session?.customer || null,
    session: session?.session || null,
    hasPermission: createHasPermission(session?.admin || session?.customer || null),
    requirePermission: createRequirePermission(session?.admin || session?.customer || null),
    auth,
  }
}
export type AuthCtx = Awaited<ReturnType<typeof getAuthCtxByHonoContext>>

export const applyAuthRoutesToHonoApp = ({ hono }: { hono: HonoBase }) => {
  hono.on(['POST', 'GET'], `${backendAuthRoutesBasePath}/*`, async (c) => await auth.handler(c.req.raw))
}

export const getMe = async (ctx: Pick<BackendCtx, 'prisma'>, userId: string): Promise<MeAuthorized> => {
  const me = await getUser(ctx, userId)
  return {
    admin: !me.admin ? null : toAdminClientAdmin(me.admin),
    customer: toCustomerClientMe(me.customer),
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
