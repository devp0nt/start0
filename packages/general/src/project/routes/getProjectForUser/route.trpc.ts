import { trpcAuthorizedUserProcedure } from '@/backend/src/services/other/trpc.js'
import { ErroryAccessDenied, ErroryNotFound } from '@/general/src/other/errory.js'
import { includesProjectWithEverything, toClientProjectForUser } from '@/general/src/project/utils.server.js'
import { zGetProjectForUserEndpointInput } from './input.js'

export const getProjectForUserTrpcRoute = trpcAuthorizedUserProcedure()
  .input(zGetProjectForUserEndpointInput)
  .query(async ({ ctx, input }) => {
    const project = await ctx.prisma.project.findFirst({
      where: {
        sn: input.projectSn,
      },
      include: includesProjectWithEverything,
    })
    if (!project) {
      throw new ErroryNotFound('Project not found')
    }
    if (project.userId !== ctx.me.user.id) {
      throw new ErroryAccessDenied('It is not your project')
    }
    return {
      project: toClientProjectForUser(project),
    }
  })
