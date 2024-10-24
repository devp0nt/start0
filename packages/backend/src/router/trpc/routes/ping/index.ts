import { trpcBaseProcedure } from '@/backend/src/services/other/trpc.js'

export const pingTrpcRoute = trpcBaseProcedure().query(async () => {
  return {
    pong: 'serverpong',
  }
})
