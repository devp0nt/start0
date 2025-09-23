// TODO:ASAP resolve circular deps here, tri0
import type { ProjectLogger } from '@devp0nt/logger0/adapters/logger0-adapter-project'
import { getFakeTimersExtension } from './extensions/fakeTimers'
import { retryTransactionsExtension } from './extensions/retryTransactions'
import { Prisma, PrismaClient } from './generated/prisma/client'

// TODO: use as separate package
// TODO: move to prisma-client not prisma-client-js

export namespace Prisma0 {
  export const createClient = ({
    logger,
    isTestNodeEnv,
    isLocalHostEnv,
  }: {
    logger: ProjectLogger
    isTestNodeEnv: boolean
    isLocalHostEnv: boolean
  }) => {
    const l = logger.extend('prisma')
    const prismaOriginal = new PrismaClient({
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
        prismaParams: isLocalHostEnv ? e.params : '***',
      })
    })
    prismaOriginal.$on('info', (e) => {
      logger.info({
        tag: 'low:info',
        message: e.message,
      })
    })

    const prismaExtended = prismaOriginal
      .$extends(getFakeTimersExtension({ isTestNodeEnv }))
      .$extends(getHighLoggingExtension({ isLocalHostEnv, l }))
      .$extends(retryTransactionsExtension)

    return prismaExtended
  }

  const getHighLoggingExtension = ({ isLocalHostEnv, l }: { isLocalHostEnv: boolean; l: ProjectLogger }) =>
    Prisma.defineExtension((prisma) =>
      prisma.$extends({
        query: {
          $allModels: {
            $allOperations: async (props) => {
              const { model, operation, args, query } = props
              const startedAt = performance.now()
              try {
                const result = await query(args)
                const durationMs = performance.now() - startedAt
                l.info({
                  tag: 'high',
                  message: 'Successfull request',
                  prismaDurationMs: durationMs,
                  other: {
                    prismaModel: model,
                    prismaOperation: operation,
                    prismaArgs: isLocalHostEnv ? args : '***',
                  },
                })
                return result
              } catch (error) {
                const durationMs = performance.now() - startedAt
                l.error({
                  tag: 'high',
                  error,
                  meta: {
                    model,
                    operation,
                    args: isLocalHostEnv ? args : '***',
                    durationMs,
                  },
                })
                throw error
              }
            },
          },
        },
      }),
    )

  export type Client = ReturnType<typeof createClient>
}
