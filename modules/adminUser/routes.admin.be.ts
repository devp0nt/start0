import { includesAdminUserWithEverything, toAdmin } from '@auth/backend/user'
import { createAdmin } from '@auth/backend/utils'
import { zAdminClientAdmin } from '@auth/shared/user'
import { honoAdminMiddleware, honoBase } from '@backend/core/hono'
import { getHonoRefineRoutesHelpers } from '@devp0nt/refine0/server'
import { withJsAsMeta } from '@devp0nt/refine0/shared'

const { getRoute, parseZOutput } = getHonoRefineRoutesHelpers({
  resource: 'admin-user',
})
const honoAdminManageMiddleware = honoAdminMiddleware({ permission: { adminUser: ['manage'] } })
const honoAdminViewMiddleware = honoAdminMiddleware({ permission: { adminUser: ['view'] } })

const zResource = zAdminClientAdmin
const zCreate = zResource
  .pick({
    name: true,
    email: true,
    role: true,
    specialPermissions: true,
    image: true,
  })
  .extend({
    specialPermissions: zResource.shape.specialPermissions.meta({
      'x-card': true,
      'x-ui:form-widget': `{{role === 'special' ? 'radio' : 'hidden'}}`,
    }),
  })
const zEdit = zCreate
const zShow = zResource.extend({
  // if we use just zPermissions, it will loose items and type, I do not know why
  // TODO: add to refine0 withJsAsMeta to map deeply
  specialPermissions: zResource.shape.specialPermissions.meta({
    'x-ui:view-widget': 'hidden',
  }),
  finalPermissions: withJsAsMeta(
    zResource.shape.specialPermissions.meta({
      title: 'Permissions',
    }),
  ),
})
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
    'x-refine-resource-meta-icon': 'ant-design:file-outlined',
    'x-refine-resource-meta-label': 'Admins',
  })

export const adminUserListAdminHonoRoute = honoBase().openapi(
  {
    ...getRoute.list({
      zResData: zList,
      middleware: [honoAdminViewMiddleware] as const,
    }),
  },
  async ({ req, json, var: { prisma, admin } }) => {
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
      include: includesAdminUserWithEverything,
    })
    const total = await prisma.adminUser.count({
      where,
    })
    return json({ data: parseZOutput.list(zList, toAdmin(adminUsers)), total }, 200)
  },
)

export const adminUserShowAdminHonoRoute = honoBase().openapi(
  getRoute.show({
    zResData: zShow,
    middleware: [honoAdminViewMiddleware] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { id } = req.valid('query')
    const adminUser = await prisma.adminUser.findUniqueOrThrow({
      where: { userId: id.toString() },
      include: includesAdminUserWithEverything,
    })
    return json({ data: parseZOutput.show(zShow, toAdmin(adminUser)) }, 200)
  },
)

export const adminUserCreateAdminHonoRoute = honoBase().openapi(
  getRoute.create({
    zResData: zResource,
    zReqData: zCreate,
    middleware: [honoAdminManageMiddleware] as const,
  }),
  async ({ req, json, var: { honoReqCtx } }) => {
    const { data } = req.valid('json')
    const admin = await createAdmin(honoReqCtx, { userData: data, adminUserData: {} })
    return json({ data: parseZOutput.create(zResource, admin) }, 200)
  },
)

export const adminUserEditAdminHonoRoute = honoBase().openapi(
  getRoute.edit({
    zResData: zResource,
    zReqData: zEdit,
    middleware: [honoAdminManageMiddleware] as const,
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
        include: includesAdminUserWithEverything,
      })
      return json({ data: parseZOutput.edit(zResource, toAdmin(adminUser)) }, 200)
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
    middleware: [honoAdminManageMiddleware] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { id } = req.valid('query')
    try {
      const adminUser = await prisma.adminUser.update({
        where: { userId: id.toString() },
        data: {
          user: {
            update: {
              role: 'customer',
            },
          },
        },
        include: includesAdminUserWithEverything,
      })
      return json({ data: parseZOutput.delete(zResource, toAdmin(adminUser)) }, 200)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return json({ error: { message: 'Item not found' } }, 404)
      }
      throw error
    }
  },
)
