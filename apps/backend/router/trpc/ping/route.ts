import { trpcBase } from '@backend/core/trpc'

// TODO: combine all routes into one file and use generator to find desired routes

export const pingTrpcRoute = trpcBase().query(async () => {
  return {
    message: 'pong',
  }
})
