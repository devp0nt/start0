import { env } from '@backend/base/env.runtime'
import { baseTri0 } from '@backend/base/tri0'
import { getFakeTimersExtension } from './extensions/fakeTimers'
import { getHighLoggingExtension } from './extensions/highLogging'
import { retryTransactionsExtension } from './extensions/retryTransactions'
import { Prisma, PrismaClient as PrismaClientOriginal } from './generated/prisma/client'

const { logger } = baseTri0.extend('prisma')

const prismaOriginal = new PrismaClientOriginal({
  transactionOptions: {
    maxWait: 10_000,
    timeout: 10_000,
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  },
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'info',
    },
  ],
})
prismaOriginal.$on('query', (e) => {
  logger.info({
    tag: 'low:query',
    message: 'Successfull prisma request',
    prismaDurationMs: e.duration,
    prismaQuery: e.query,
    prismaParams: env.isLocalHostEnv ? e.params : '***',
  })
})
prismaOriginal.$on('info', (e) => {
  logger.info({
    tag: 'low:info',
    message: e.message,
  })
})

export const prisma = prismaOriginal
  .$extends(getFakeTimersExtension({ enabled: env.isTestNodeEnv }))
  .$extends(getHighLoggingExtension({ logger }))
  .$extends(retryTransactionsExtension)

export type PrismaClient = typeof prisma
