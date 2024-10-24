import { createAppContext } from '@/backend/src/services/other/ctx.js'
import { isLocalHostEnv } from '@/backend/src/services/other/env.js'
import { logger } from '@/backend/src/services/other/logger.js'
import { seed1 } from '@/backend/src/services/other/seed/seeds.js'

export const seedScript = async () => {
  try {
    const ctx = await createAppContext()
    if (isLocalHostEnv()) {
      await seed1(ctx)
      logger.info({ message: 'Seeding done', tag: 'seed' })
    } else {
      logger.info({ message: 'Not seeding in non-local env', tag: 'seed' })
    }
  } catch (error) {
    logger.error({ tag: 'seed', error })
  }
}

void seedScript()
