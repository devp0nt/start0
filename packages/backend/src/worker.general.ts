import { createAppContext } from '@/backend/src/services/other/ctx.js'
import { workWithFrequencyLogCleaner } from '@/backend/src/services/other/frequency.js'
import { logger } from '@/backend/src/services/other/logger.js'
import { presetDb } from '@/backend/src/services/other/presetDb.js'
import { isMain } from 'svag-esm'

export const startBackendWorkerGeneral = async () => {
  let heartbeatInterval: NodeJS.Timeout | null = null

  const gracefulShutdown = () => {
    // TODO why app(web) restarting on scale worker to 0
    // TODO why not triggerd on heroku scale down?
    !!heartbeatInterval && clearInterval(heartbeatInterval)
    logger.info({
      tag: 'worker-general:stop',
      // eslint-disable-next-line n/no-process-env
      message: `worker-general ${process.env.SOURCE_VERSION} stopped`,
    })
    process.exit(0)
  }

  try {
    const ctx = await createAppContext()
    await presetDb({ ctx })
    workWithFrequencyLogCleaner({ ctx })

    logger.info({
      tag: 'worker-general:start',
      message: `Worker general started`,
    })
    const heartbeat = () => {
      logger.info({
        tag: 'heartbeat:workerGeneral',
        message: `worker-general ${ctx.env.SOURCE_VERSION} alive`,
      })
    }
    heartbeat()
    heartbeatInterval = setInterval(heartbeat, 10_000)

    // process.on('SIGTERM', () => {
    //   gracefulShutdown()
    // })
    // process.on('SIGINT', () => {
    //   gracefulShutdown()
    // })
  } catch (error) {
    logger.error({ tag: 'workerGeneral', error })
    gracefulShutdown()
  }
}

if (isMain(import.meta)) {
  void startBackendWorkerGeneral()
}
