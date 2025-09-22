import { BackendCtx } from '@backend/core/lib/ctx'
import { T0 } from '@backend/core/lib/tri0'

export const startWorkerProcess = async () => {
  const tri0 = T0.create()
  const ctx = BackendCtx.create({ tri0, service: 'worker' })
  const { logger } = tri0.extend('root')
  try {
    await ctx.self.init()
    logger.info(`Worker started`)
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * 3))
      logger.info(`Worker is still alive`)
    }
  } catch (e: any) {
    logger.error(e)
    await ctx.self.destroy()
  }
}

if (import.meta.main) {
  void startWorkerProcess()
}
