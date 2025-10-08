import { trpcBase } from '@backend/core/trpc'

export const pingAppTrpcRoute = trpcBase().query(async () => {
  return {
    message: 'pong',
  }
})
