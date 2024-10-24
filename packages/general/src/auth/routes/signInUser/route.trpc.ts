import { handleFrequencyChecker } from '@/backend/src/services/other/frequency.js'
import { trpcBaseProcedure } from '@/backend/src/services/other/trpc.js'
import { getPasswordHash, signJwtAuth } from '@/general/src/auth/utils.server.js'
import { ErroryExpected } from '@/general/src/other/errory.js'
import { normalizeEmail } from 'svag-utils'
import { zSignInUserEndpointInput } from './input.js'

export const signInUserTrpcRoute = trpcBaseProcedure()
  .input(zSignInUserEndpointInput)
  .mutation(async ({ ctx, input }) => {
    const email = normalizeEmail(input.email)
    await handleFrequencyChecker({
      ctx,
      procedureName: 'signInUser',
      email,
      maxPerEmail: 5,
      limitMinutes: 10,
    })
    const user = await ctx.prisma.user.findFirst({
      where: {
        email,
        password: getPasswordHash(input.password),
      },
    })
    if (!user) {
      throw new ErroryExpected('Wrong email or password')
    }
    if (user.bannedAt) {
      throw new ErroryExpected('Your account is banned, contact the administration')
    }
    const token = signJwtAuth({
      ...ctx.me.jwtPayload,
      user: {
        authTokenSource: user.authTokenSource,
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
      userId: user.id,
    }
  })
