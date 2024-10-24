import { trpcAuthorizedUserProcedure } from '@/backend/src/services/other/trpc.js'
import { createActionLogByData } from '@/general/src/actionLog/utils.server.js'
import { ErroryNotFound } from '@/general/src/other/errory.js'
import { includesProjectWithEverything, toClientProjectForAdmin } from '@/general/src/project/utils.server.js'
import { zUpdateProjectForUserEndpointInput } from './input.js'

export const updateProjectForUserTrpcRoute = trpcAuthorizedUserProcedure()
  .input(zUpdateProjectForUserEndpointInput)
  .mutation(async ({ ctx, input }) => {
    const { projectId, ...restInput } = input
    const project = await ctx.prisma.project.findFirst({
      where: {
        id: projectId,
      },
    })
    if (!project) {
      throw new ErroryNotFound('Project not found')
    }
    const updatedProject = await ctx.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        ...restInput,
      },
      include: includesProjectWithEverything,
    })
    await createActionLogByData({
      ctx,
      action: 'updateProjectForUser',
      actorType: 'admin',
      userId: ctx.me.user.id,
      data: {
        input,
      },
    })

    return {
      project: toClientProjectForAdmin(updatedProject),
    }
  })
