import { zUpdateMyPasswordForUserEndpointInput } from './input.js'
import { trpcAuthorizedUserProcedure } from '@/backend/src/services/other/trpc.js'
import { createActionLogByData } from '@/general/src/actionLog/utils.server.js'
import { getPasswordHash } from '@/general/src/auth/utils.server.js'
import { ErroryExpected } from '@/general/src/other/errory.js'
import { includesUserWithEverything } from '@/general/src/user/utils.server.js'

export const updateMyPasswordForUserTrpcRoute = trpcAuthorizedUserProcedure()
  .input(zUpdateMyPasswordForUserEndpointInput)
  .mutation(async ({ ctx, input }) => {
    const oldPasswordHash = getPasswordHash(input.oldPassword)
    if (ctx.me.user.password !== oldPasswordHash) {
      throw new ErroryExpected('Old password is incorrect')
    }
    const updatedUser = await ctx.prisma.user.update({
      where: {
        id: ctx.me.user.id,
      },
      data: {
        password: getPasswordHash(input.newPassword),
      },
      include: includesUserWithEverything,
    })
    ctx.me = {
      ...ctx.me,
      user: updatedUser,
    }
    await createActionLogByData({
      ctx,
      user: ctx.me.user,
      actorType: 'user',
      action: 'updateMyPasswordForUser',
    })

    return {
      ok: true,
    }
  })
