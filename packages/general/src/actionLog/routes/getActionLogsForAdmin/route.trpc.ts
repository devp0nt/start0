import { zGetActionLogsForAdminEndpointInput } from './input.js'
import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { includesActionLogWithEverything, toClientActionLog } from '@/general/src/actionLog/utils.server.js'
import { toPaginatedItems } from 'svag-utils'

export const getActionLogsForAdminTrpcRoute = trpcAuthorizedAdminProcedure()
  .input(zGetActionLogsForAdminEndpointInput)
  .query(async ({ ctx, input }) => {
    const dealWhere = input.projectId
      ? {
          projectId: input.projectId,
        }
      : {}
    const { items, hasNextPage, nextCursor } = toPaginatedItems({
      itemsPlusOne: await ctx.prisma.actionLog.findMany({
        where: {
          AND: [
            {
              ...(input.cursor ? { sn: { lte: input.cursor } } : {}),
            },
            {
              ...dealWhere,
            },
          ],
        },
        include: includesActionLogWithEverything,
        orderBy: { sn: 'desc' },
        take: input.limit + 1,
      }),
      limit: input.limit,
      itemCursorKey: 'sn',
    })
    return {
      actionLogs: items.map((al) => toClientActionLog(al)),
      hasNextPage,
      nextCursor,
    }
  })
