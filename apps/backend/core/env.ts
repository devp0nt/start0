import { Env0 } from '@devp0nt/env0'
import z from 'zod'

export const createEnv = (source: Record<string, unknown>) => {
  return Env0.create({
    source,
    schema: ({ ez, optionalOnNotLocalHostEnv }) =>
      z.object({
        NODE_ENV: ez.nodeEnv,
        HOST_ENV: ez.hostEnv,
        PORT: ez.int,
        BACKEND_URL: ez.string,
        ADMIN_URL: ez.string,
        SITE_URL: ez.string,
        DATABASE_URL: ez.string,
        INITIAL_ADMIN_EMAIL: ez.string,
        INITIAL_ADMIN_PASSWORD: ez.string,
        SHADOW_DATABASE_URL: optionalOnNotLocalHostEnv(ez.string),
        DEBUG: ez.string,
      }),
  })
}
export type Env = ReturnType<typeof createEnv>
