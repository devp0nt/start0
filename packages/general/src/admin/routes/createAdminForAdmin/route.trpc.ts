import { welcomeAdminEmail } from '@/backend/src/services/other/emails/defs/welcomeAdmin/index.js'
import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { createActionLogByData } from '@/general/src/actionLog/utils.server.js'
import { includesAdminWithEverything, toClientAdminForAdmin } from '@/general/src/admin/utils.server.js'
import { getPasswordHash } from '@/general/src/auth/utils.server.js'
import { ErroryExpected } from '@/general/src/other/errory.js'
import { getRandomString, normalizeEmail } from 'svag-utils'
import { zCreateAdminForAdminEndpointInput } from './input.js'

export const createAdminForAdminTrpcRoute = trpcAuthorizedAdminProcedure({
  permission: 'manageAdmins',
})
  .input(zCreateAdminForAdminEndpointInput)
  .mutation(async ({ ctx, input }) => {
    return await ctx.prisma.$transaction(async (tprisma) => {
      const anotherAdminWithSameEmail = await tprisma.admin.findFirst({
        where: {
          email: normalizeEmail(input.email),
        },
      })
      if (anotherAdminWithSameEmail) {
        throw new ErroryExpected('Admin with this email already exists')
      }
      const password = getRandomString({ length: 8, symbols: true })
      const admin = await tprisma.admin.create({
        data: {
          ...input,
          email: normalizeEmail(input.email),
          password: getPasswordHash(password),
        },
        include: includesAdminWithEverything,
      })
      void welcomeAdminEmail.send({
        to: admin.email,
        variables: {
          email: admin.email,
          password,
        },
      })
      await createActionLogByData({
        ctx: {
          ...ctx,
          prisma: tprisma,
        },
        action: 'createAdminForAdmin',
        actorType: 'admin',
        adminId: ctx.me.admin.id,
        data: {
          ...input,
        },
      })

      return {
        admin: toClientAdminForAdmin(admin),
      }
    })
  })
