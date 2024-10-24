import { zGetUserForAdminEndpointInput } from './input.js'
import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { ErroryNotFound } from '@/general/src/other/errory.js'
import { includesUserWithEverything, toClientUserForAdmin } from '@/general/src/user/utils.server.js'

export const getUserForAdminTrpcRoute = trpcAuthorizedAdminProcedure({ permission: 'viewUsers' })
  .input(zGetUserForAdminEndpointInput)
  .query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findFirst({
      where: {
        sn: input.userSn,
      },
      include: includesUserWithEverything,
    })
    if (!user) {
      throw new ErroryNotFound('User not found')
    }
    return {
      user: toClientUserForAdmin(user),
    }
  })
