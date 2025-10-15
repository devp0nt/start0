import { honoAdminMiddleware, honoBase } from '@hono/backend'
import { getHonoRefineRoutesHelpers } from '@devp0nt/refine0/server'
import { zIdeaClientAdmin } from '@idea/shared/utils.sh'

const { getRoute, parseZOutput } = getHonoRefineRoutesHelpers({ resource: 'idea' })

const zResource = zIdeaClientAdmin
const zCreate = zResource.omit({
  id: true,
  sn: true,
  createdAt: true,
  updatedAt: true,
})
const zEdit = zCreate
const zShow = zResource
const zList = zResource
  .pick({
    id: true,
    sn: true,
    createdAt: true,
    title: true,
  })
  .extend({
    id: zResource.shape.id.meta({ 'x-hidden': true }),
  })
  .meta({
    'x-refine-resource-meta-icon': 'ant-design:file-outlined',
  })

export const ideaListAdminHonoRoute = honoBase().openapi(
  {
    ...getRoute.list({
      zResData: zList,
      middleware: [honoAdminMiddleware({ permission: { idea: ['view'] } })] as const,
    }),
  },
  async ({ req, json, var: { prisma } }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { filters, pagination, sorters } = req.valid('json')
    // TODO: convert filters to where
    // TODO: convert sorters to orderBy
    const where = {
      deletedAt: null,
    }
    const ideas = await prisma.idea.findMany({
      where,
      take: pagination.pageSize,
      skip: (pagination.currentPage - 1) * pagination.pageSize,
      orderBy: { createdAt: 'desc' },
    })
    const total = await prisma.idea.count({
      where,
    })
    return json({ data: parseZOutput.list(zList, ideas), total }, 200)
  },
)

export const ideaShowAdminHonoRoute = honoBase().openapi(
  getRoute.show({
    zResData: zShow,
    middleware: [honoAdminMiddleware({ permission: { idea: ['view'] } })] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { id } = req.valid('query')
    const idea = await prisma.idea.findUnique({
      where: { id: id.toString(), deletedAt: null },
    })
    if (!idea) {
      return json({ error: { message: 'Item not found' } }, 404)
    }
    return json({ data: parseZOutput.show(zShow, idea) }, 200)
  },
)

export const ideaCreateAdminHonoRoute = honoBase().openapi(
  getRoute.create({
    zResData: zResource,
    zReqData: zCreate,
    middleware: [honoAdminMiddleware({ permission: { idea: ['manage'] } })] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { data } = req.valid('json')
    const idea = await prisma.idea.create({
      data: { ...data },
    })
    return json({ data: parseZOutput.create(zResource, idea) }, 200)
  },
)

export const ideaEditAdminHonoRoute = honoBase().openapi(
  getRoute.edit({
    zResData: zResource,
    zReqData: zEdit,
    middleware: [honoAdminMiddleware({ permission: { idea: ['manage'] } })] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { data, id } = req.valid('json')
    try {
      const idea = await prisma.idea.update({
        where: { id: id.toString() },
        data,
      })
      return json({ data: parseZOutput.edit(zResource, idea) }, 200)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return json({ error: { message: 'Item not found' } }, 404)
      }
      throw error
    }
  },
)

export const ideaDeleteAdminHonoRoute = honoBase().openapi(
  getRoute.delete({
    zResData: zResource,
    middleware: [honoAdminMiddleware({ permission: { idea: ['manage'] } })] as const,
  }),
  async ({ req, json, var: { prisma } }) => {
    const { id } = req.valid('query')
    try {
      const idea = await prisma.idea.update({
        where: { id: id.toString() },
        data: { deletedAt: new Date() },
      })
      return json({ data: parseZOutput.delete(zResource, idea) }, 200)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return json({ error: { message: 'Item not found' } }, 404)
      }
      throw error
    }
  },
)
