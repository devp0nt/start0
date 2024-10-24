/* eslint-disable n/no-process-env */
import { createEnvThings, zEnvRequired, zEnvRequiredOnNotLocalHost, zHostEnv, zNodeEnv } from 'svag-env'
import { z } from 'zod'

export const zWebappEnv = z.object({
  HOST_ENV: zHostEnv,
  NODE_ENV: zNodeEnv,
  VITE_BACKEND_URL: zEnvRequired,
  VITE_WEBAPP_URL: zEnvRequired,
  SOURCE_VERSION: zEnvRequiredOnNotLocalHost,
  VITE_WEBAPP_SENTRY_DSN: zEnvRequiredOnNotLocalHost,
  VITE_S3_URL: zEnvRequiredOnNotLocalHost,
})

const publicEnvFromBackend = typeof window !== 'undefined' ? (window as any).publicEnvFromBackend : undefined
export const rawEnv: Record<string, any> =
  publicEnvFromBackend?.replaceMeWithPublicEnvFromBackend || !publicEnvFromBackend
    ? { ...globalThis.process.env, ...process.env }
    : { ...globalThis.process.env, ...process.env, ...publicEnvFromBackend }

export const { getAllEnv, getOneEnv, getSomeEnv, isDevelopmentNodeEnv } = createEnvThings({
  name: 'webapp',
  source: rawEnv,
  schema: zWebappEnv,
})
