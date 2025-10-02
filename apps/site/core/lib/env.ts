import { Env0, ez } from '@devp0nt/env0'
import z from 'zod'

export const createEnvBuild = (source: Record<string, unknown>) =>
  Env0.create({
    source,
    schema: ({ ez, optionalOnLocalHostEnv }) =>
      z.object({
        PORT: ez.int,
        X: optionalOnLocalHostEnv(ez.boolean),
      }),
  })
export type EnvBuild = ReturnType<typeof createEnvBuild>

export const createEnv = (source: Record<string, unknown>) =>
  Env0.create({
    source,
    schema: z.object({
      VITE_TRPC_URL: ez.string,
    }),
  })
export type Env = ReturnType<typeof createEnv>
