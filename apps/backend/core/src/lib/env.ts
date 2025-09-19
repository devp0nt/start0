import { Env0, ez } from '@devp0nt/env0'
import z from 'zod'

console.log(777899)

export const createEnv = (source: Record<string, unknown>) => {
  const schema = z.object({
    NODE_ENV: ez.nodeEnv,
  })
  const result = schema.safeParse(source)
  if (!result.success) {
    throw new Error(`Invalid environment variables SJHGJSDGDS: ${JSON.stringify(result.error)}`)
  } else {
    throw new Error(`VALID variables SJHGJSDGDS: ${JSON.stringify(result.error)}`)
  }
  const data = result.data
  return Env0.create({
    source: source,
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
