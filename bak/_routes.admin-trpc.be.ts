// import { trpcBase } from '@backend/core/trpc'
// import { Error0 } from '@devp0nt/error0'
// import { zIdeaClientAdmin } from '@idea/shared/utils.sh'
// import { getTrpcRefineRoutesHelpers } from '@refine0/admin/routes-trpc.be'
// import { z } from 'zod'

// const { getMeta, getZInput, getZOutput, parseZOutput } = getTrpcRefineRoutesHelpers({ resource: 'idea' })

// const zFilters = z.object({}).optional().default({})
// const zResource = zIdeaClientAdmin
// const zCreate = zResource.omit({
//   id: true,
//   sn: true,
//   createdAt: true,
//   updatedAt: true,
// })
// const zEdit = zCreate
// const zShow = zResource
// const zList = zResource.pick({
//   id: true,
//   sn: true,
//   createdAt: true,
//   title: true,
// })

// export const ideaListAdminTrpcRoute = trpcBase()
//   .meta(getMeta.list('idea'))
//   .input(getZInput.list(zFilters))
//   .output(getZOutput.list(zList))
//   .query(async ({ ctx, input }) => {
//     const ideas = await ctx.prisma.idea.findMany({
//       where: { ...input.filters },
//       take: input.pagination.take,
//       skip: input.pagination.skip,
//       orderBy: { createdAt: 'desc' },
//     })
//     const total = await ctx.prisma.idea.count({
//       where: input.filters,
//     })
//     return { data: parseZOutput.list(zList, ideas), total }
//   })

// export const ideaGetAdminTrpcRoute = trpcBase()
//   .meta(getMeta.get('idea'))
//   .input(getZInput.get())
//   .output(getZOutput.get(zShow))
//   .query(async ({ ctx, input }) => {
//     const idea = await ctx.prisma.idea.findUnique({
//       where: { id: input.id },
//     })
//     if (!idea) {
//       throw new Error0('Item not found', { expected: true })
//     }
//     return { data: parseZOutput.get(zShow, idea) }
//   })

// export const ideaCreateAdminTrpcRoute = trpcBase()
//   .meta(getMeta.create('idea'))
//   .input(getZInput.create(zCreate))
//   .output(getZOutput.create(zResource))
//   .mutation(async ({ ctx, input }) => {
//     const idea = await ctx.prisma.idea.create({
//       data: { ...input.data },
//     })
//     return { data: parseZOutput.create(zResource, idea) }
//   })

// export const ideaUpdateAdminTrpcRoute = trpcBase()
//   .meta(getMeta.update('idea'))
//   .input(getZInput.update(zEdit))
//   .output(getZOutput.update(zResource))
//   .mutation(async ({ ctx, input }) => {
//     try {
//       const idea = await ctx.prisma.idea.update({
//         where: { id: input.id },
//         data: input.data,
//       })
//       return { data: parseZOutput.update(zResource, idea) }
//     } catch (error: any) {
//       if (error.code === 'P2025') {
//         throw new Error0('Item not found', { cause: error, expected: true })
//       }
//       throw error
//     }
//   })

// export const ideaDeleteAdminTrpcRoute = trpcBase()
//   .meta(getMeta.delete('idea'))
//   .input(getZInput.delete())
//   .output(getZOutput.delete(zResource))
//   .mutation(async ({ ctx, input }) => {
//     try {
//       const idea = await ctx.prisma.idea.delete({
//         where: { id: input.id },
//       })
//       return { data: parseZOutput.delete(zResource, idea) }
//     } catch (error: any) {
//       if (error.code === 'P2025') {
//         throw new Error0('Item not found', { cause: error, expected: true })
//       }
//       throw error
//     }
//   })
