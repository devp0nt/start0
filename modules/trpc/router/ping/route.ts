import { trpcBase } from '@trpc/backend'

export const pingAppTrpcRoute = trpcBase().query(async () => {
  return {
    message: 'pong',
  }
})
