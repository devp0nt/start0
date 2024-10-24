import { trpcAuthorizedUserProcedure } from '@/backend/src/services/other/trpc.js'
import { includesProjectWithEverything, toClientProjectForUser } from '@/general/src/project/utils.server.js'
import { toPaginatedItems } from 'svag-utils'
import { zGetProjectsForUserEndpointInput } from './input.js'

export const getProjectsForUserTrpcRoute = trpcAuthorizedUserProcedure()
  .input(zGetProjectsForUserEndpointInput)
  .query(async ({ ctx, input }) => {
    const { items, hasNextPage, nextCursor } = toPaginatedItems({
      itemsPlusOne: await ctx.prisma.project.findMany({
        where: {
          userId: ctx.me.user.id,
          ...(input.cursor ? { sn: { lte: input.cursor } } : {}),
        },
        include: includesProjectWithEverything,
        orderBy: { sn: 'desc' },
        take: input.limit + 1,
      }),
      limit: input.limit,
      itemCursorKey: 'sn',
    })
    return {
      projects: items.map((project) => toClientProjectForUser(project)),
      hasNextPage,
      nextCursor,
    }
  })
