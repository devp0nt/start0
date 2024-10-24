import { zGetAdminForAdminEndpointInput } from './input.js'
import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { includesAdminWithEverything, toClientAdminForAdmin } from '@/general/src/admin/utils.server.js'
import { ErroryNotFound } from '@/general/src/other/errory.js'

export const getAdminForAdminTrpcRoute = trpcAuthorizedAdminProcedure()
  .input(zGetAdminForAdminEndpointInput)
  .query(async ({ ctx, input }) => {
    const admin = await ctx.prisma.admin.findFirst({
      where: {
        sn: input.adminSn,
      },
      include: includesAdminWithEverything,
    })
    if (!admin) {
      throw new ErroryNotFound('Admin not found')
    }
    return {
      admin: toClientAdminForAdmin(admin),
    }
  })
