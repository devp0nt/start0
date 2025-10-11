import { env } from '@backend/base/env.runtime'
import type { Tri0 } from '@backend/base/tri0'
import { Ctx0 } from '@devp0nt/ctx0'
import { prisma } from '@prisma/backend'

export const backendCtx = Ctx0.create('backend', async ({ tri0 }: { tri0: Tri0 }) => {
  return {
    tri0,
    prisma,
    env,
  }
})
export type BackendCtx = typeof backendCtx
export type BackendCtxValue = Ctx0.InferValue<BackendCtx>
