import { zSignOutEndpointInput } from './input.js'
import { trpcBaseProcedure } from '@/backend/src/services/other/trpc.js'
import { signOut } from '@/general/src/auth/utils.server.js'

export const signOutTrpcRoute = trpcBaseProcedure()
  .input(zSignOutEndpointInput)
  .mutation(async ({ ctx, input }) => {
    const { token } = signOut({ ctx, role: input.role })
    return {
      token,
    }
  })
