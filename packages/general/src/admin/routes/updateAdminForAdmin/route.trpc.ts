import { trpcAuthorizedAdminProcedure } from '@/backend/src/services/other/trpc.js'
import { createActionLogByData } from '@/general/src/actionLog/utils.server.js'
import { includesAdminWithEverything, toClientAdminForAdmin } from '@/general/src/admin/utils.server.js'
import { ErroryExpected, ErroryNotFound } from '@/general/src/other/errory.js'
import { normalizeEmail } from 'svag-utils'
import { zUpdateAdminForAdminEndpointInput } from './input.js'

export const updateAdminForAdminTrpcRoute = trpcAuthorizedAdminProcedure()
  .input(zUpdateAdminForAdminEndpointInput)
  .mutation(async ({ ctx, input }) => {
    const { adminId, banned, ...restInput } = input
    const admin = await ctx.prisma.admin.findFirst({
      where: {
        id: adminId,
      },
    })
    if (!admin) {
      throw new ErroryNotFound('Admin not found')
    }
    const anotherAdminWithSameEmail = await ctx.prisma.admin.findFirst({
      where: {
        email: normalizeEmail(restInput.email),
        id: {
          not: adminId,
        },
      },
    })
    if (anotherAdminWithSameEmail) {
      throw new ErroryExpected('Admin with this email already exists')
    }
    const updatedAdmin = await ctx.prisma.admin.update({
      where: {
        id: adminId,
      },
      data: {
        ...restInput,
        email: normalizeEmail(restInput.email),
        bannedAt: banned ? admin.bannedAt || new Date() : null,
      },
      include: includesAdminWithEverything,
    })
    await createActionLogByData({
      ctx,
      action: 'updateAdminForAdmin',
      actorType: 'admin',
      adminId: ctx.me.admin.id,
      data: {
        input,
      },
    })
    return {
      admin: toClientAdminForAdmin(updatedAdmin),
    }
  })
