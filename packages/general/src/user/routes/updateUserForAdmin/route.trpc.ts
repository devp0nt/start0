import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { createActionLogByData } from '@/general/src/actionLog/utils.server.js'
import { ErroryExpected, ErroryNotFound } from '@/general/src/other/errory.js'
import { includesUserWithEverything, toClientUserForAdmin } from '@/general/src/user/utils.server.js'
import { normalizeEmail } from 'svag-utils'
import { zUpdateUserForAdminEndpointInput } from './input.js'

export const updateUserForAdminTrpcRoute = trpcAuthorizedAdminProcedure({
  permission: 'manageUsers',
})
  .input(zUpdateUserForAdminEndpointInput)
  .mutation(async ({ ctx, input }) => {
    const { userId, banned, ...restInput } = input
    const user = await ctx.prisma.user.findFirst({
      where: {
        id: userId,
      },
    })
    if (!user) {
      throw new ErroryNotFound('User not found')
    }
    const anotherUserWithSameEmail = await ctx.prisma.user.findFirst({
      where: {
        email: normalizeEmail(restInput.email),
        id: {
          not: userId,
        },
      },
    })
    if (anotherUserWithSameEmail) {
      throw new ErroryExpected('User with this email already exists')
    }
    const updatedUser = await ctx.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...restInput,
        email: normalizeEmail(restInput.email),
        bannedAt: banned ? user.bannedAt || new Date() : null,
      },
      include: includesUserWithEverything,
    })
    await createActionLogByData({
      ctx,
      action: 'updateUserForAdmin',
      actorType: 'admin',
      adminId: ctx.me.admin.id,
      data: {
        input,
      },
    })
    return {
      user: toClientUserForAdmin(updatedUser),
    }
  })
