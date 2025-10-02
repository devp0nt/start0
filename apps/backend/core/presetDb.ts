import { auth } from '@auth/backend/utils.be'
import type { BackendCtx } from '@backend/core/ctx'

export const presetDb = async (ctx: BackendCtx.Self) => {
  await Promise.all([
    (async () => {
      const initialAdminUser = await ctx.prisma.user.findUnique({
        where: {
          email: ctx.env.INITIAL_ADMIN_EMAIL,
        },
      })
      if (!initialAdminUser) {
        await auth.api.createUser({
          body: {
            email: ctx.env.INITIAL_ADMIN_EMAIL,
            password: ctx.env.INITIAL_ADMIN_PASSWORD,
            name: ctx.env.INITIAL_ADMIN_EMAIL,
            role: 'admin',
          },
        })
      }
    })(),
  ])
}
