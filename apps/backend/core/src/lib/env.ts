import { Env0 as E } from "@devp0nt/env0"
import z from "zod"

export const createEnv = (source: Record<string, unknown>) =>
  E.create({
    source: source,
    schema: z.object({
      NODE_ENV: E.zNodeEnv,
      HOST_ENV: E.zHostEnv,
      PORT: E.zInt,
      DATABASE_URL: E.zString,
      DEBUG: E.zString,
    }),
  })
export type Env = ReturnType<typeof createEnv>
