import { zUpdateMyPasswordForAdminEndpointInput } from './input.js'
import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { createActionLogByData } from '@/general/src/actionLog/utils.server.js'
import { includesAdminWithEverything } from '@/general/src/admin/utils.server.js'
import { getPasswordHash } from '@/general/src/auth/utils.server.js'
import { ErroryExpected } from '@/general/src/other/errory.js'

export const updateMyPasswordForAdminTrpcRoute = trpcAuthorizedAdminProcedure()
  .input(zUpdateMyPasswordForAdminEndpointInput)
  .mutation(async ({ ctx, input }) => {
    const oldPasswordHash = getPasswordHash(input.oldPassword)
    if (ctx.me.admin.password !== oldPasswordHash) {
      throw new ErroryExpected('Old password is incorrect')
    }
    const updatedAdmin = await ctx.prisma.admin.update({
      where: {
        id: ctx.me.admin.id,
      },
      data: {
        password: getPasswordHash(input.newPassword),
      },
      include: includesAdminWithEverything,
    })
    ctx.me = {
      ...ctx.me,
      admin: updatedAdmin,
    }
    await createActionLogByData({
      ctx,
      actorType: 'admin',
      admin: ctx.me.admin,
      action: 'updateMyPasswordForAdmin',
    })

    return {
      ok: true,
    }
  })
