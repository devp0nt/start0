import { getSomeEnv, isProductionNodeEnv } from '@/backend/src/services/other/env.js'
import * as Sentry from '@sentry/node'
import path from 'path'
import { get__dirname } from 'svag-esm'

const __dirname = get__dirname(import.meta)

const env = getSomeEnv(['BACKEND_SENTRY_DSN', 'HOST_ENV', 'NODE_ENV', 'SOURCE_VERSION'])

// TODO
// https://github.com/getsentry/sentry-javascript/issues/12011
const isSentryEnabled = env.BACKEND_SENTRY_DSN && isProductionNodeEnv()

if (isSentryEnabled) {
  Sentry.init({
    dsn: env.BACKEND_SENTRY_DSN,
    environment: env.HOST_ENV,
    release: env.SOURCE_VERSION,
    normalizeDepth: 10,
    integrations: [
      Sentry.rewriteFramesIntegration({
        // path to dist directory relative to this file in dist dir
        root: path.resolve(__dirname, '../../../..'),
      }),
    ],
  })
}

export const trackError = (error: Error, meta?: any) => {
  if (isSentryEnabled) {
    return Sentry.captureException(error, meta)
  }
  return null
}
