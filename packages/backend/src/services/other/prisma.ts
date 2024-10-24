import '@/backend/src/types/prisma.js'
import { getSomeEnv } from '@/backend/src/services/other/env.js'
import { logger } from '@/backend/src/services/other/logger.js'
import { isTestEnv } from '@/backend/src/test/helpers/testEnv.js'
import { Prisma, PrismaClient } from '@prisma/client'
import { backOff } from 'exponential-backoff'
import _ from 'lodash'

export const getAllPrismaModelsNames = (prisma: any) => {
  return Object.keys(prisma)
    .filter((modelName) => !modelName.startsWith('_') && !modelName.startsWith('$'))
    .map((modelName) => modelName.charAt(0).toUpperCase() + modelName.slice(1))
}

export const isTestDb = () => {
  const env = getSomeEnv(['NODE_ENV', 'DATABASE_URL'])
  return env.NODE_ENV === 'test' && env.DATABASE_URL.includes('-test')
}

export const isClearableDb = () => {
  const env = getSomeEnv(['HOST_ENV', 'DATABASE_URL'])
  return env.HOST_ENV === 'local' || env.DATABASE_URL.includes('-test')
}

let lastStartingDelay = 100
const getStartingDelay = () => {
  if (!isTestEnv()) {
    return _.random(100, 200)
  }
  const newStartingDelay = lastStartingDelay + 100
  if (newStartingDelay > 1_000) {
    lastStartingDelay = 100
    return 100
  }
  lastStartingDelay = newStartingDelay
  return newStartingDelay
}
const retryTransactionsExtension = Prisma.defineExtension((prisma: any) =>
  prisma.$extends({
    client: {
      $transaction: async (...args: any) => {
        return await backOff(() => prisma.$transaction.apply(prisma, args), {
          retry: (e) => {
            const normalCode = e.code
            // parse e.message like this
            // ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "25P02", message: "current transaction is aborted, commands ignored until end of transaction block", severity: "ERROR", detail: None, column: None, hint: None }), transient: false })
            const secretCode = e.message.match(/PostgresError \{ code: "([^"]+)"/)?.[1]
            const code = normalCode || secretCode
            // Retry the transaction only if the error was due to a write conflict or deadlock
            // See: https://www.prisma.io/docs/reference/api-reference/error-reference#p2034
            const isTransactionErrorCode = code === 'P2034' || code === '25P02'
            return isTransactionErrorCode
          },
          jitter: 'none',
          numOfAttempts: 6,
          startingDelay: getStartingDelay(),
          timeMultiple: 2,
        })
      },
    } as { $transaction: (typeof prisma)['$transaction'] },
  })
)

export const createPrismaClient = () => {
  const env = getSomeEnv(['HOST_ENV'])
  const prisma = new PrismaClient({
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

  prisma.$on('query', (e: any) => {
    logger.info({
      tag: 'prisma:low:query',
      message: 'Successfull request',
      meta: {
        query: e.query,
        duration: e.duration,
        params: env.HOST_ENV === 'local' ? e.params : '***',
      },
    })
  })

  prisma.$on('info', (e: any) => {
    logger.info({ tag: 'prisma:low:info', message: e.message })
  })

  let extendedPrisma = prisma.$extends({
    query: {
      $allModels: {
        $allOperations: async (props: any) => {
          const { model, operation, args, query } = props
          const start = Date.now()
          try {
            const result = await query(args)
            const durationMs = Date.now() - start
            logger.info({
              tag: 'prisma:high',
              message: 'Successfull request',
              meta: { model, operation, args: env.HOST_ENV === 'local' ? args : '***', durationMs },
            })
            return result
          } catch (error) {
            const durationMs = Date.now() - start
            logger.error({
              tag: 'prisma:high',
              error,
              meta: { model, operation, args: env.HOST_ENV === 'local' ? args : '***', durationMs },
            })
            throw error
          }
        },
      },
    },
  })

  extendedPrisma = extendedPrisma.$extends(retryTransactionsExtension)

  return extendedPrisma
}

export const clearDb = async (prisma: any) => {
  if (!isClearableDb()) {
    throw new Error('This operation is not allowed in this environment')
  }
  const modelsNames = getAllPrismaModelsNames(prisma)
  for (const modelName of modelsNames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${modelName}" CASCADE;`)
  }
}

export type AppPrisma = ReturnType<typeof createPrismaClient>
export type CuttedPrisma = Omit<AppPrisma, '$extends' | '$transaction' | '$disconnect' | '$connect' | '$on' | '$user'>
export type AnyPrisma = AppPrisma | CuttedPrisma

export * from '@prisma/client'
