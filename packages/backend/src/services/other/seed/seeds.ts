/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { isNotLocalHostEnv } from '@/backend/src/services/other/env.js'
import { presetDb } from '@/backend/src/services/other/presetDb.js'
import { clearDb } from '@/backend/src/services/other/prisma.js'
import { getSeedFns } from '@/backend/src/services/other/seed/index.js'

export const seed1 = async (ctx: AppContext) => {
  if (isNotLocalHostEnv()) {
    throw new Error('Cannot seed in not local host env')
  }
  await clearDb(ctx.prisma)
  await presetDb({ ctx })
  const s = getSeedFns(ctx)
  const a = await s.admin({})
  const u = await s.user({})
  const p = await s.project({ user: u })
}
