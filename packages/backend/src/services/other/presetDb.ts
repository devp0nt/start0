import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { adminPermissions } from '@/general/src/auth/can.js'
import { getPasswordHash } from '@/general/src/auth/utils.server.js'
import type { AdminPermission } from '@prisma/client'

export const presetDb = async ({ ctx }: { ctx: AppContext }) => {
  const permissions = adminPermissions as never as AdminPermission[]
  await ctx.prisma.admin.upsert({
    where: {
      id: 'initial-admin',
    },
    update: {
      permissions,
    },
    create: {
      id: 'initial-admin',
      permissions,
      email: ctx.env.INITIAL_ADMIN_EMAIL,
      password: getPasswordHash(ctx.env.INITIAL_ADMIN_PASSWORD),
    },
  })
}
