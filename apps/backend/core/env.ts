import { Env0, ez } from '@devp0nt/env0'
import z from 'zod'

export const createEnv = (source: Record<string, unknown>) => {
  return Env0.create({
    source,
    schema: z.object({
      NODE_ENV: ez.nodeEnv,
      HOST_ENV: ez.hostEnv,
      PORT: ez.int,
      DATABASE_URL: ez.string,
      DEBUG: ez.string,
    }),
  })
}
export type Env = ReturnType<typeof createEnv>
