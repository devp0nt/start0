/* eslint-disable n/no-process-env */
import { createEnvThings, zEnvRequired } from 'svag-env'
import z from 'zod'

declare global {
  const publicEnvFromBackend: Record<string, string> | undefined
}
const windowEnv = typeof publicEnvFromBackend !== 'undefined' ? publicEnvFromBackend : {}

const sharedRawEnv = {
  ...globalThis.process.env,
  ...process.env,
  ...windowEnv,
} as Record<string, string>

export const { getOneEnv: getOneSharedEnv } = createEnvThings({
  name: 'shared',
  source: {
    WEBAPP_URL: sharedRawEnv.VITE_WEBAPP_URL || sharedRawEnv.WEBAPP_URL,
  },
  schema: z.object({
    WEBAPP_URL: zEnvRequired,
  }),
})
