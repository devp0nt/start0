import { BackendCtx, Tri0 } from '@backend/core/lib/ctx'

export const startWorkerProcess = async () => {
  const tri0 = Tri0.create()
  const ctx = BackendCtx.create({ tri0, service: 'worker' })
  const { logger } = tri0.extend('root')
  try {
    await ctx.self.init()
    logger.info(`Worker started`)
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 60))
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
