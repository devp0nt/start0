import { appplyApiRoutesToExpressApp } from '@/backend/src/router/rest/index.js'
import { trpcRouter } from '@/backend/src/router/trpc/index.js'
import { createAppContext } from '@/backend/src/services/other/ctx.js'
import { applyAppEmailsPreviewsToExpressApp } from '@/backend/src/services/other/emails/preview.js'
// import { isLocalHostEnv } from '@/backend/src/services/other/env.js'
import { logger } from '@/backend/src/services/other/logger.js'
import { applyRequestClientDataToExpressApp } from '@/backend/src/services/other/requestClientData.js'
// import { seed1 } from '@/backend/src/services/other/seed/seeds.js'
import { applyServeWebApp } from '@/backend/src/services/other/serveWebApp.js'
import { applyStorikToExpressApp } from '@/backend/src/services/other/storik.js'
import { applyTrpcToExpressApp } from '@/backend/src/services/other/trpc.js'
import { applyAuthToExpressApp } from '@/general/src/auth/utils.server.js'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import basicAuth from 'express-basic-auth'
import { isMain } from 'svag-esm'

export const startBackendApp = async () => {
  let heartbeatInterval: NodeJS.Timeout | null = null

  const gracefulShutdown = () => {
    heartbeatInterval && clearInterval(heartbeatInterval)
    logger.info({
      tag: 'app:stop',
      // eslint-disable-next-line n/no-process-env
      message: `app ${process.env.SOURCE_VERSION} stopped`,
    })
    process.exit(0)
  }

  try {
    const ctx = await createAppContext()
    const expressApp = express()
    expressApp.use(cors())
    expressApp.use(compression())
    expressApp.use(express.json())
    expressApp.get('/ping', (req, res) => {
      res.send('pong')
    })
    expressApp.use(cookieParser())
    // await presetDb({ ctx }) // will be called in worker general
    // await seed1(ctx)
    applyRequestClientDataToExpressApp({ expressApp })
    appplyApiRoutesToExpressApp({ expressApp, ctx })
    applyStorikToExpressApp({ expressApp })
    applyAuthToExpressApp({ expressApp, ctx })
    applyTrpcToExpressApp({ expressApp, appContext: ctx, trpcRouter })
    applyAppEmailsPreviewsToExpressApp({ expressApp })

    const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = ctx.env

    if (BASIC_AUTH_USERNAME && BASIC_AUTH_PASSWORD) {
      expressApp.use((req, res, next) => {
        // const excludeRouteRegex = new RegExp()
        const extExists = /\.[a-z0-9]+$/.test(req.path)
        const devRoute = req.path.startsWith('/@vite') || req.path.startsWith('/@react-refresh')
        if (
          // excludeRouteRegex ||
          extExists ||
          devRoute
        ) {
          next()
          return
        }
        void basicAuth({
          users: { [BASIC_AUTH_USERNAME]: BASIC_AUTH_PASSWORD },
          challenge: true,
          realm: 'Access to web-service',
        })(req, res, next)
      })
    }

    await applyServeWebApp({
      ctx,
      expressApp,
    })
    expressApp.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error({ tag: 'express', error })
      if (res.headersSent) {
        next(error)
        return
      }
      res.status(500).send('Internal server error')
    })
    expressApp.listen(ctx.env.PORT, () => {
      logger.info({
        tag: 'express:listen:start',
        message: `Express start listening`,
        meta: { url: `http://localhost:${ctx.env.PORT}` },
      })
    })

    logger.info({
      tag: 'app:start',
      message: `App started`,
    })
    const heartbeat = () => {
      logger.info({
        tag: 'heartbeat:app',
        message: `app ${ctx.env.SOURCE_VERSION} alive`,
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
    logger.error({ tag: 'app', error })
    gracefulShutdown()
  }
}

if (isMain(import.meta)) {
  void startBackendApp()
}
