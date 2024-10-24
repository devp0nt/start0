import { trpcBaseProcedure } from '@/backend/src/services/other/trpc.js'
import { toClientMe } from '@/general/src/auth/utils.server.js'

export const getMeTrpcRoute = trpcBaseProcedure().query(async ({ ctx }) => {
  return {
    me: toClientMe(ctx.me),
  }
})
