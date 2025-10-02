import { getRoutesHelpers, parseZod } from '@apps/shared/backend'
import { trpcBase } from '@backend/core/trpc'
import { Error0 } from '@devp0nt/error0'
import { zIdeaClientAdmin } from '@idea/shared/utils.sh'
import { z } from 'zod'

const helpers = getRoutesHelpers({ resource: 'idea' })
const { zPaginationInput, defaultPagination } = helpers.pagination

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

export const ideaListAdminTrpcRoute = trpcBase()
  .meta({ openapi: { method: 'POST', path: '/idea/list' } })
  .input(
    z
      .object({
        filters: zFilters,
        pagination: zPaginationInput,
      })
      .optional()
      .default({ filters: {}, pagination: defaultPagination }),
  )
  .output(
    z.object({
      data: zList.array(),
      total: z.number(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const ideas = await ctx.prisma.idea.findMany({
      where: { ...input.filters },
      take: input.pagination.take,
      skip: input.pagination.skip,
      orderBy: { createdAt: 'desc' },
    })
    const total = await ctx.prisma.idea.count({
      where: input.filters,
    })
    return { data: parseZod(zList, ideas), total }
  })

export const ideaGetAdminTrpcRoute = trpcBase()
  .meta({ openapi: { method: 'GET', path: '/idea/get' } })
  .input(
    z.object({
      id: z.uuid(),
    }),
  )
  .output(
    z.object({
      data: zShow,
    }),
  )
  .query(async ({ ctx, input }) => {
    const idea = await ctx.prisma.idea.findUnique({
      where: { id: input.id },
    })
    if (!idea) {
      throw new Error0('Item not found', { expected: true })
    }
    return { data: parseZod(zShow, idea) }
  })

export const ideaCreateAdminTrpcRoute = trpcBase()
  .meta({ openapi: { method: 'POST', path: '/idea/create' } })
  .input(
    z.object({
      data: zCreate,
    }),
  )
  .output(
    z.object({
      data: zResource,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const idea = await ctx.prisma.idea.create({
      data: { ...input.data },
    })
    return { data: parseZod(zResource, idea) }
  })

export const ideaUpdateAdminTrpcRoute = trpcBase()
  .meta({ openapi: { method: 'POST', path: '/idea/update' } })
  .input(
    z.object({
      id: z.uuid(),
      data: zEdit,
    }),
  )
  .output(
    z.object({
      data: zResource,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const idea = await ctx.prisma.idea.update({
        where: { id: input.id },
        data: input.data,
      })
      return { data: parseZod(zResource, idea) }
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error0('Item not found', { cause: error, expected: true })
      }
      throw error
    }
  })

export const ideaDeleteAdminTrpcRoute = trpcBase()
  .meta({ openapi: { method: 'POST', path: '/idea/delete' } })
  .input(
    z.object({
      id: z.uuid(),
    }),
  )
  .output(
    z.object({
      data: zResource,
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const idea = await ctx.prisma.idea.delete({
        where: { id: input.id },
      })
      return { data: parseZod(zResource, idea) }
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error0('Item not found', { cause: error, expected: true })
      }
      throw error
    }
  })
