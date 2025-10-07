import { honoAdminBase } from '@backend/core/hono'
import { getHonoRefineRoutesHelpers } from '@devp0nt/refine0/server/hono'
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
    id: zResource.shape.id.meta({ 'x-invisible': true }),
  })

export const ideaListAdminHonoRoute = honoAdminBase().openapi(
  getRoute.list({
    zResData: zList,
  }),
  async ({ req, json, var: { prisma } }) => {
    const body = req.valid('json')
    // TODO: convert filters to where
    // TODO: convert sorters to orderBy
    const where = {}
    const ideas = await prisma.idea.findMany({
      where,
      take: body.pagination.pageSize,
      skip: (body.pagination.currentPage - 1) * body.pagination.pageSize,
      orderBy: { createdAt: 'desc' },
    })
    const total = await prisma.idea.count({
      where,
    })
    return json({ data: parseZOutput.list(zList, ideas), total }, 200)
  },
)

export const ideaShowAdminHonoRoute = honoAdminBase().openapi(
  getRoute.show({
    zResData: zShow,
  }),
  async ({ req, json, var: { prisma } }) => {
    const query = req.valid('query')
    const idea = await prisma.idea.findUnique({
      where: { id: query.id.toString() },
    })
    if (!idea) {
      return json({ error: { message: 'Item not found' } }, 404)
    }
    return json({ data: parseZOutput.show(zShow, idea) }, 200)
  },
)

export const ideaCreateAdminHonoRoute = honoAdminBase().openapi(
  getRoute.create({
    zResData: zResource,
    zReqData: zCreate,
  }),
  async ({ req, json, var: { prisma } }) => {
    const body = req.valid('json')
    const idea = await prisma.idea.create({
      data: { ...body.data },
    })
    return json({ data: parseZOutput.create(zResource, idea) }, 200)
  },
)

export const ideaEditAdminHonoRoute = honoAdminBase().openapi(
  getRoute.edit({
    zResData: zResource,
    zReqData: zEdit,
  }),
  async ({ req, json, var: { prisma } }) => {
    const body = req.valid('json')
    try {
      const idea = await prisma.idea.update({
        where: { id: body.id.toString() },
        data: body.data,
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

export const ideaDeleteAdminHonoRoute = honoAdminBase().openapi(
  getRoute.delete({
    zResData: zResource,
  }),
  async ({ req, json, var: { prisma } }) => {
    const query = req.valid('query')
    try {
      const idea = await prisma.idea.delete({
        where: { id: query.id.toString() },
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
