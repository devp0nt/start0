import { baseTri0 } from '@backend/base/tri0'
import { backendCtx } from '@backend/ctx'
import { presetDb } from '@backend/core/presetDb'
import { applyUncaughtExceptionCatcher } from '@backend/core/uncaught'

const tri0 = baseTri0.extend({
  service: 'worker',
})

export const startWorkerProcess = async () => {
  await backendCtx.self.init({ tri0 })
  const { logger } = backendCtx.tri0.extend('worker')

  await presetDb(backendCtx)
  logger.info(`Worker started`)
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 60))
    logger.info(`Worker is still alive`)
  }
}

if (import.meta.main) {
  applyUncaughtExceptionCatcher({ tri0, ctx: backendCtx })
  void startWorkerProcess()
}
