import { trpcAuthorizedUserProcedure } from '@/backend/src/services/other/trpc.js'
import { createActionLogByData } from '@/general/src/actionLog/utils.server.js'
import { includesProjectWithEverything, toClientProjectForUser } from '@/general/src/project/utils.server.js'
import { zCreateProjectForUserEndpointInput } from './input.js'

export const createProjectForUserTrpcRoute = trpcAuthorizedUserProcedure()
  .input(zCreateProjectForUserEndpointInput)
  .mutation(async ({ ctx, input }) => {
    return await ctx.prisma.$transaction(async (tprisma) => {
      const project = await tprisma.project.create({
        data: {
          ...input,
          userId: ctx.me.user.id,
        },
        include: includesProjectWithEverything,
      })
      await createActionLogByData({
        ctx: {
          ...ctx,
          prisma: tprisma,
        },
        action: 'createProjectForUser',
        actorType: 'user',
        userId: ctx.me.user.id,
        data: {
          ...input,
        },
      })

      return {
        project: toClientProjectForUser(project),
      }
    })
  })
