/* eslint-disable @typescript-eslint/init-declarations */
/* eslint-disable n/no-process-env */
import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { createAppContext } from '@/backend/src/services/other/ctx.js'
import { presetDb } from '@/backend/src/services/other/presetDb.js'
import { throwIfNotTestEnv } from '@/backend/src/test/helpers/testEnv.js'
import type { TestUtils } from '@/backend/src/test/helpers/utils.js'
import { getAllTestUtils } from '@/backend/src/test/helpers/utils.js'
import { jest } from '@jest/globals'

throwIfNotTestEnv()
jest.setTimeout(120_000)

export let u: TestUtils
export let ctx: AppContext
export let p: AppContext['prisma']

beforeAll(async () => {
  ctx = await createAppContext()
  u = getAllTestUtils(ctx)
  p = ctx.prisma
})

beforeEach(async () => {
  jest.clearAllMocks()
  u.setDate('2021-01-10')
  if (!process.env.TEST_DO_NOT_CLEAR_DB) {
    await u.clearDb()
  }
  await presetDb({ ctx })
})

afterEach(async () => {
  jest.useRealTimers()
})

afterAll(async () => {
  await ctx.stop()
})
