import { Env0 as E } from "@ideanick/modules/lib/env0.sh"
import z from "zod"

export const createEnvBuild = (source: Record<string, unknown>) =>
  E.create({
    source: source,
    schema: ({ optionalOnLocalHostEnv }) =>
      z.object({
        PORT: E.zInt,
        X: optionalOnLocalHostEnv(E.zBoolean),
      }),
  })
export type EnvBuild = ReturnType<typeof createEnvBuild>

export const createEnv = (source: Record<string, unknown>) =>
  E.create({
    source: source,
    schema: z.object({
      VITE_TRPC_URL: E.zString,
    }),
  })
export type Env = ReturnType<typeof createEnv>
