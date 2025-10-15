import { Env0, ez } from '@devp0nt/env0'
import z from 'zod'

export const createEnv = (source: Record<string, unknown>) =>
  Env0.create({
    source,
    schema: z.object({
      EXPO_PUBLIC_BACKEND_URL: ez.string,
    }),
  })
export type Env = ReturnType<typeof createEnv>
