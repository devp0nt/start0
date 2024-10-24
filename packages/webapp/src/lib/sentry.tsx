import { getSomeEnv } from '@/webapp/src/lib/env.js'
import * as Sentry from '@sentry/react'

const env = getSomeEnv(['VITE_WEBAPP_SENTRY_DSN', 'HOST_ENV', 'SOURCE_VERSION', 'NODE_ENV'])

const isSentryEnabled = env.VITE_WEBAPP_SENTRY_DSN && env.NODE_ENV !== 'test'

if (isSentryEnabled) {
  Sentry.init({
    dsn: env.VITE_WEBAPP_SENTRY_DSN,
    environment: env.HOST_ENV,
    release: env.SOURCE_VERSION,
    normalizeDepth: 10,
  })
}

export const trackError = (error: Error, meta?: any) => {
  if (isSentryEnabled) {
    Sentry.captureException(error, meta)
  }
}
