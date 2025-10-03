import { honoAdminBase } from '@backend/core/hono'
import { zIdeaClientAdmin } from '@idea/shared/utils.sh'
import { getHonoRefineRoutesHelpers } from '@refine0/admin/hono.be'
import { z } from 'zod'

const { getRoute, parseZOutput } = getHonoRefineRoutesHelpers({ resource: 'idea' })

const zFilters = z.object({}).optional().default({})
const zResource = zIdeaClientAdmin
const zCreate = zResource.omit({
  id: true,
  sn: true,
  createdAt: true,
  updatedAt: true,
})
const zEdit = zCreate
const zShow = zResource
const zList = zResource.pick({
  id: true,
  sn: true,
  createdAt: true,
  title: true,
})

export const ideaListAdminHonoRoute = honoAdminBase().openapi(
  getRoute.list({
    zResData: zList,
    zFilters,
  }),
  async ({ req, json, var: { prisma } }) => {
    const body = req.valid('json')
    const ideas = await prisma.idea.findMany({
      where: { ...body.filters },
      take: body.pagination.take,
      skip: body.pagination.skip,
      orderBy: { createdAt: 'desc' },
    })
    const total = await prisma.idea.count({
      where: body.filters,
    })
    return json({ data: parseZOutput.list(zList, ideas), total }, 200)
  },
)

export const ideaGetAdminHonoRoute = honoAdminBase().openapi(
  getRoute.get({
    zResData: zShow,
  }),
  async ({ req, json, var: { prisma } }) => {
    const query = req.valid('query')
    const idea = await prisma.idea.findUnique({
      where: { id: query.id },
    })
    if (!idea) {
      return json({ error: { message: 'Item not found' } }, 404)
    }
    return json({ data: parseZOutput.get(zShow, idea) }, 200)
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

export const ideaUpdateAdminHonoRoute = honoAdminBase().openapi(
  getRoute.update({
    zResData: zResource,
    zReqData: zEdit,
  }),
  async ({ req, json, var: { prisma } }) => {
    const body = req.valid('json')
    try {
      const idea = await prisma.idea.update({
        where: { id: body.id },
        data: body.data,
      })
      return json({ data: parseZOutput.update(zResource, idea) }, 200)
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
        where: { id: query.id },
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
