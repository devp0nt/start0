import { zGetUsersForAdminEndpointInput } from './input.js'
import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { includesUserWithEverything, toClientUserForAdmin } from '@/general/src/user/utils.server.js'

export const getUsersForAdminTrpcRoute = trpcAuthorizedAdminProcedure({
  permission: 'viewUsers',
})
  .input(zGetUsersForAdminEndpointInput)
  .query(async ({ ctx, input }) => {
    const users = await ctx.prisma.user.findMany({
      where: {},
      include: includesUserWithEverything,
    })
    return {
      users: users.map(toClientUserForAdmin),
    }
  })
