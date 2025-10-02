import type { Hono0 } from '@backend/core/hono'
import { backendAuthRoutesBasePath } from '@backend/shared/utils'
import { PrismaClient } from '@prisma0/backend/generated/prisma/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, openAPI } from 'better-auth/plugins'
import type { Context as HonoContext } from 'hono'
import { cors } from 'hono/cors'
import { v4 as uuidv4 } from 'uuid'

// npx @better-auth/cli generate --config modules/auth/backend/auth.ts --output modules/prisma0/backend/schema1.prisma

export const auth = betterAuth({
  database: prismaAdapter(new PrismaClient(), {
    provider: 'postgresql',
  }),
  plugins: [admin(), openAPI()],
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

// path hardocded by better-auth
export const authOpenapiSchemaUrl = `${backendAuthRoutesBasePath}/open-api/generate-schema`

export const getAuthCtxValueByHonoContext = async (honoCtx: HonoContext) => {
  const session = await auth.api.getSession({ headers: honoCtx.req.raw.headers })
  return {
    user: session?.user || null,
    session: session?.session || null,
    auth,
  }
}

export const applyAuthRoutesToHonoApp = ({ hono }: { hono: Hono0 }) => {
  hono.use(
    `${backendAuthRoutesBasePath}/*`,
    cors({
      origin: [process.env.ADMIN_URL || ''],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    }),
  )

  hono.on(['POST', 'GET'], `${backendAuthRoutesBasePath}/*`, async (c) => await auth.handler(c.req.raw))
}
