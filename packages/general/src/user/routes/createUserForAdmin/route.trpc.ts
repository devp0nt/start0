import { welcomeUserEmail } from '@/backend/src/services/other/emails/defs/welcomeUser/index.js'
import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { createActionLogByData } from '@/general/src/actionLog/utils.server.js'
import { getPasswordHash } from '@/general/src/auth/utils.server.js'
import { ErroryExpected } from '@/general/src/other/errory.js'
import { includesUserWithEverything, toClientUserForAdmin } from '@/general/src/user/utils.server.js'
import { getRandomString, normalizeEmail } from 'svag-utils'
import { zCreateUserForAdminEndpointInput } from './input.js'

export const createUserForAdminTrpcRoute = trpcAuthorizedAdminProcedure({
  permission: 'manageUsers',
})
  .input(zCreateUserForAdminEndpointInput)
  .mutation(async ({ ctx, input }) => {
    return await ctx.prisma.$transaction(async (tprisma) => {
      const anotherUserWithSameEmail = await tprisma.user.findFirst({
        where: {
          email: normalizeEmail(input.email),
        },
      })
      if (anotherUserWithSameEmail) {
        throw new ErroryExpected('User with this email already exists')
      }
      const restInput = { ...input }
      const password = getRandomString({ length: 8, symbols: true })
      const user = await tprisma.user.create({
        data: {
          ...restInput,
          email: normalizeEmail(input.email),
          password: getPasswordHash(password),
        },
        include: includesUserWithEverything,
      })
      void welcomeUserEmail.send({
        to: user.email,
        variables: {
          email: user.email,
          password,
        },
      })
      await createActionLogByData({
        ctx: {
          ...ctx,
          prisma: tprisma,
        },
        action: 'createUserForAdmin',
        actorType: 'admin',
        adminId: ctx.me.admin.id,
        data: {
          ...input,
        },
      })

      return {
        user: toClientUserForAdmin(user),
      }
    })
  })
