import { zGetAdminsForAdminEndpointInput } from './input.js'
import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { includesAdminWithEverything, toClientAdminForAdmin } from '@/general/src/admin/utils.server.js'

export const getAdminsForAdminTrpcRoute = trpcAuthorizedAdminProcedure()
  .input(zGetAdminsForAdminEndpointInput)
  .query(async ({ ctx, input }) => {
    const admins = await ctx.prisma.admin.findMany({
      where: {},
      include: includesAdminWithEverything,
    })
    return {
      admins: admins.map(toClientAdminForAdmin),
    }
  })
