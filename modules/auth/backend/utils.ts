import {
  getUser,
  includesAdminUserWithEverything,
  includesCustomerUserWithEverything,
  toAdmin,
  toAdminClientAdmin,
  toCustomer,
  toCustomerClientMe,
  toUserClientMe,
} from '@auth/backend/user'
import type { MeAuthorized } from '@auth/shared/user'
import { env } from '@backend/base/env.runtime'
import { createTagged, type Tri0 } from '@backend/base/tri0'
import { backendAuthRoutesBasePath } from '@backend/shared/utils'
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { PrismaClient } from '@prisma/backend'
import { prisma } from '@prisma/backend'
import type {
  AdminUserCreateInput,
  CustomerUserCreateInput,
  UserCreateInput,
} from '@prisma/backend/generated/prisma/models'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession, openAPI } from 'better-auth/plugins'
import generatePasswordTs from 'generate-password-ts'
import type { Context as HonoContext } from 'hono'
import { v4 as uuidv4 } from 'uuid'
import {
  adminRoles,
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
      generateId: () => uuidv4(),
    },
  },
  trustedOrigins: [env.ADMIN_URL, env.SITE_URL].flatMap((url) => url || []),
})

// path hardcoded by better-auth "open-api/generate-schema"
export const authOpenapiSchemaUrl = `${backendAuthRoutesBasePath}/open-api/generate-schema`

export const getAuthCtxByHonoCtx = async (honoCtx: HonoContext) => {
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
export type AuthCtx = Awaited<ReturnType<typeof getAuthCtxByHonoCtx>>

export const applyAuthRoutesToHonoApp = ({ hono }: { hono: OpenAPIHono }) => {
  hono.on(['POST', 'GET'], `${backendAuthRoutesBasePath}/*`, async (c) => await auth.handler(c.req.raw))
}

export const getMe = async (ctx: { prisma: PrismaClient }, userId: string): Promise<MeAuthorized> => {
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

const tagged = createTagged('auth')

export const createAdmin = async (
  { tri0, prisma }: { tri0: Tri0; prisma: PrismaClient },
  {
    password: providedPassword,
    userData,
    adminUserData,
  }: {
    password?: string
    userData: UserCreateInput
    adminUserData: Omit<AdminUserCreateInput, 'user'>
  },
) => {
  const { Error0 } = tagged(tri0)
  const password = providedPassword || generatePassword()
  const { email, name, role, ...restUserData } = userData
  if (!role || !adminRoles.includes(role)) {
    throw new Error0(`Invalid admin role: ${role}`)
  }
  const createUserResult = await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role,
      data: {
        ...restUserData,
      } satisfies Partial<UserCreateInput>,
    },
  })
  const adminWithEverything = await prisma.adminUser.create({
    data: {
      ...adminUserData,
      userId: createUserResult.user.id,
    },
    include: includesAdminUserWithEverything,
  })
  // TODO: send email with password
  if (!providedPassword) {
    // eslint-disable-next-line no-console
    console.log({ password })
  }
  return toAdmin(adminWithEverything)
}

export const createCustomer = async (
  { prisma, tri0 }: { prisma: PrismaClient; tri0: Tri0 },
  {
    password: providedPassword,
    userData,
    customerUserData,
  }: {
    password?: string
    userData: UserCreateInput
    customerUserData: Omit<CustomerUserCreateInput, 'user'>
  },
) => {
  const { Error0 } = tagged(tri0)
  const password = providedPassword || generatePassword()
  const { email, name, role, ...restUserData } = userData
  if (role && adminRoles.includes(role)) {
    throw new Error0(`Invalid customer role: ${role}`)
  }
  const createUserResult = await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role,
      data: {
        ...restUserData,
      } satisfies Partial<UserCreateInput>,
    },
  })
  const customerWithEverything = await prisma.customerUser.create({
    data: {
      ...customerUserData,
      userId: createUserResult.user.id,
    },
    include: includesCustomerUserWithEverything,
  })
  // TODO: send email with password
  if (!providedPassword) {
    // eslint-disable-next-line no-console
    console.log({ password })
  }
  return toCustomer(customerWithEverything)
}
