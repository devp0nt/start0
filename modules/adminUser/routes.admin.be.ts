import { toAdminUserServer } from '@adminUser/admin/utils.be'
import { zAdminUserClientAdmin } from '@adminUser/shared/utils.sh'
import { generatePassword } from '@auth/admin/backend/utils'
import { honoAdminMiddleware, honoBase } from '@backend/core/hono'
import { getHonoRefineRoutesHelpers } from '@devp0nt/refine0/server/hono'
import type { UserCreateInput } from '@prisma0/backend/generated/prisma/models'

const { getRoute, parseZOutput } = getHonoRefineRoutesHelpers({ resource: 'admin' })

const zResource = zAdminUserClientAdmin
const zCreate = zResource
  .pick({
    name: true,
    email: true,
    role: true,
    permissions: true,
    image: true,
  })
  .extend({
    permissions: zResource.shape.permissions.meta({ 'x-card': true }),
  })
const zEdit = zCreate
const zShow = zResource
const zList = zResource
  .pick({
    id: true,
    sn: true,
    email: true,
    name: true,
    role: true,
  })
  .extend({
    id: zResource.shape.id.meta({ 'x-hidden': true }),
  })
  .meta({
    'x-refine-meta-icon': 'ant-design:file-outlined',
  })

export const adminUserListAdminHonoRoute = honoBase().openapi(
  {
    ...getRoute.list({
      zResData: zList,
      middleware: [honoAdminMiddleware({ permission: { adminUser: ['view'] } })] as const,
    }),
  },
  async ({ req, json, var: { prisma } }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { filters, pagination, sorters } = req.valid('json')
    // TODO: convert filters to where
    // TODO: convert sorters to orderBy
    const where = {}
    const adminUsers = await prisma.adminUser.findMany({
      where,
      take: pagination.pageSize,
      skip: (pagination.currentPage - 1) * pagination.pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    })
    const total = await prisma.adminUser.count({
      where,
    })
    return json({ data: parseZOutput.list(zList, toAdminUserServer(adminUsers)), total }, 200)
  },
)

export const adminUserShowAdminHonoRoute = honoBase().openapi(
  getRoute.show({
    zResData: zShow,
    middleware: [honoAdminMiddleware({ permission: { adminUser: ['view'] } })] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { id } = req.valid('query')
    const adminUser = await prisma.adminUser.findUniqueOrThrow({
      where: { userId: id.toString() },
      include: {
        user: true,
      },
    })
    return json({ data: parseZOutput.show(zShow, toAdminUserServer(adminUser)) }, 200)
  },
)

export const adminUserCreateAdminHonoRoute = honoBase().openapi(
  getRoute.create({
    zResData: zResource,
    zReqData: zCreate,
    middleware: [honoAdminMiddleware({ permission: { adminUser: ['manage'] } })] as const,
  }),
  async ({ req, json, var: { prisma, auth } }) => {
    const { data } = req.valid('json')

    const password = generatePassword()
    // TODO: send email with password
    // eslint-disable-next-line no-console
    console.log({ password })
    const createResult = await auth.api.createUser({
      body: {
        email: data.email,
        password,
        name: data.name,
        role: data.role,
        data: {
          permissions: data.permissions,
          image: data.image,
        } satisfies Partial<UserCreateInput>,
      },
    })
    const adminUser = await prisma.adminUser.findUniqueOrThrow({
      where: {
        userId: createResult.user.id,
      },
      include: {
        user: true,
      },
    })
    return json({ data: parseZOutput.create(zResource, toAdminUserServer(adminUser)) }, 200)
  },
)

export const adminUserEditAdminHonoRoute = honoBase().openapi(
  getRoute.edit({
    zResData: zResource,
    zReqData: zEdit,
    middleware: [honoAdminMiddleware({ permission: { adminUser: ['manage'] } })] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { data, id } = req.valid('json')
    try {
      const adminUser = await prisma.adminUser.update({
        where: { userId: id.toString() },
        data: {
          user: {
            update: {
              data,
            },
          },
        },
        include: {
          user: true,
        },
      })
      return json({ data: parseZOutput.edit(zResource, toAdminUserServer(adminUser)) }, 200)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return json({ error: { message: 'Item not found' } }, 404)
      }
      throw error
    }
  },
)

export const adminUserDeleteAdminHonoRoute = honoBase().openapi(
  getRoute.delete({
    zResData: zResource,
    middleware: [honoAdminMiddleware({ permission: { adminUser: ['manage'] } })] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { id } = req.valid('query')
    try {
      const adminUser = await prisma.adminUser.update({
        where: { userId: id.toString() },
        data: {
          user: {
            update: {
              role: 'user',
            },
          },
        },
        include: {
          user: true,
        },
      })
      return json({ data: parseZOutput.delete(zResource, toAdminUserServer(adminUser)) }, 200)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return json({ error: { message: 'Item not found' } }, 404)
      }
      throw error
    }
  },
)
