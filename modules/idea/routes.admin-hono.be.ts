import { getRoutesHelpers, parseZod } from '@apps/shared/backend'
import { honoAdminBase } from '@backend/core/hono'
import { zIdeaClientAdmin } from '@idea/shared/utils.sh'
import { z } from 'zod'

const helpers = getRoutesHelpers({ resource: 'idea' })
const {
  getResourceListRouteSettings,
  getResourceGetRouteSettings,
  getResourceCreateRouteSettings,
  getResourceUpdateRouteSettings,
  getResourceDeleteRouteSettings,
} = helpers.settings
const { zPaginationInput } = helpers.pagination

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
  getResourceListRouteSettings({
    zRes: zList,
    zFilters,
  }),
  async ({ req, json, var: { prisma } }) => {
    const body = req.valid('json')
    const pagination = zPaginationInput.parse(body.pagination)
    const filters = zFilters.parse(body.filters)
    const ideas = await prisma.idea.findMany({
      where: { ...filters },
      take: pagination.take,
      skip: pagination.skip,
      orderBy: { createdAt: 'desc' },
    })
    const total = await prisma.idea.count({
      where: filters,
    })
    return json({ data: parseZod(zList, ideas), total }, 200)
  },
)

export const ideaGetAdminHonoRoute = honoAdminBase().openapi(
  getResourceGetRouteSettings({
    zRes: zShow,
  }),
  async ({ req, json, var: { prisma } }) => {
    const query = req.valid('query')
    const idea = await prisma.idea.findUnique({
      where: { id: query.id },
    })
    if (!idea) {
      return json({ error: { message: 'Item not found' } }, 404)
    }
    return json({ data: parseZod(zShow, idea) }, 200)
  },
)

export const ideaCreateAdminHonoRoute = honoAdminBase().openapi(
  getResourceCreateRouteSettings({
    zRes: zResource,
    zReq: zCreate,
  }),
  async ({ req, json, var: { prisma } }) => {
    const body = req.valid('json')
    const idea = await prisma.idea.create({
      data: { ...body.data },
    })
    return json({ data: parseZod(zResource, idea) }, 200)
  },
)

export const ideaUpdateAdminHonoRoute = honoAdminBase().openapi(
  getResourceUpdateRouteSettings({
    zRes: zResource,
    zReq: zEdit,
  }),
  async ({ req, json, var: { prisma } }) => {
    const body = req.valid('json')
    try {
      const idea = await prisma.idea.update({
        where: { id: body.id },
        data: body.data,
      })
      return json({ data: parseZod(zResource, idea) }, 200)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return json({ error: { message: 'Item not found' } }, 404)
      }
      throw error
    }
  },
)

export const ideaDeleteAdminHonoRoute = honoAdminBase().openapi(
  getResourceDeleteRouteSettings({
    zRes: zResource,
  }),
  async ({ req, json, var: { prisma } }) => {
    const query = req.valid('query')
    try {
      const idea = await prisma.idea.delete({
        where: { id: query.id },
      })
      return json({ data: parseZod(zResource, idea) }, 200)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return json({ error: { message: 'Item not found' } }, 404)
      }
      throw error
    }
  },
)
