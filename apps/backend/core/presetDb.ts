import { auth } from '@auth/backend/utils'
import type { BackendCtx } from '@backend/ctx'

export const presetDb = async (ctx: BackendCtx) => {
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
