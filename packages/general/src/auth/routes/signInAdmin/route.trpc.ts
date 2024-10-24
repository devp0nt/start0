import { handleFrequencyChecker } from '@/backend/src/services/other/frequency.js'
import { trpcBaseProcedure } from '@/backend/src/services/other/trpc.js'
import { getPasswordHash, signJwtAuth } from '@/general/src/auth/utils.server.js'
import { ErroryExpected } from '@/general/src/other/errory.js'
import { normalizeEmail } from 'svag-utils'
import { zSignInAdminEndpointInput } from './input.js'

export const signInAdminTrpcRoute = trpcBaseProcedure()
  .input(zSignInAdminEndpointInput)
  .mutation(async ({ ctx, input }) => {
    const email = normalizeEmail(input.email)
    await handleFrequencyChecker({
      ctx,
      procedureName: 'signInAdmin',
      email,
      maxPerEmail: 10,
      limitMinutes: 10,
    })
    const admin = await ctx.prisma.admin.findFirst({
      where: {
        email,
        password: getPasswordHash(input.password),
      },
    })
    if (!admin) {
      throw new ErroryExpected('Wrong email or password')
    }
    if (admin.bannedAt) {
      throw new ErroryExpected('Your account is banned, contact the administration')
    }
    const token = signJwtAuth({
      ...ctx.me.jwtPayload,
      admin: {
        authTokenSource: admin.authTokenSource,
      },
    })
    ctx.res.cookie('svagatron-token', token, {
      maxAge: 9_000_000_000,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
    return {
      token,
      adminId: admin.id,
    }
  })
