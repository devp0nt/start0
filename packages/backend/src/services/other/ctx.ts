import { getAllEnv } from '@/backend/src/services/other/env.js'
import { logger } from '@/backend/src/services/other/logger.js'
import { createPrismaClient } from '@/backend/src/services/other/prisma.js'

export const createAppContext = async () => {
  const ctx = {
    env: getAllEnv(),
    prisma: createPrismaClient(),
    stop: async () => {},
  }
  process.on('exit', () => {
    ctx.stop().catch((error) => {
      logger.error({
        message: 'Failed to stop app context',
        error,
        tag: 'appContext',
      })
    })
  })
  return ctx
}

export type AppContext = Awaited<ReturnType<typeof createAppContext>>
