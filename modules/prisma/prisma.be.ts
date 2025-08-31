import { BackendCtx } from "@ideanick/backend/lib/ctx"
import { Prisma0Models } from "@ideanick/modules/prisma/generated.be/prisma0/models.js"
import { backOff } from "exponential-backoff"
import { Prisma, PrismaClient } from "./generated.be/prisma/client.js"

// TODO: use as separate package
// TODO: move to prisma-client not prisma-client-js

export namespace Prisma0 {
  export const createClient = ({ ctx }: { ctx: BackendCtx }) => {
    const { logger } = BackendCtx.extendExtendable(ctx, {
      tagPrefix: "prisma",
    })
    const prismaOriginal = new PrismaClient({
      transactionOptions: {
        maxWait: 10_000,
        timeout: 10_000,
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
      log: [
        {
          emit: "event",
          level: "query",
        },
        {
          emit: "event",
          level: "info",
        },
      ],
    })

    prismaOriginal.$on("query", (e) => {
      logger.info({
        tag: "low:query",
        message: "Successfull prisma request",
        prismaDurationMs: e.duration,
        prismaQuery: e.query,
        prismaParams: ctx.env.isLocalHostEnv ? e.params : "***",
      })
    })
    prismaOriginal.$on("info", (e) => {
      logger.info({
        tag: "low:info",
        message: e.message,
      })
    })

    const prismaExtended = prismaOriginal
      .$extends(getFakeTimersExtension({ ctx }))
      .$extends(getHighLoggingExtension({ ctx }))
      .$extends(retryTransactionsExtension)

    return prismaExtended
  }

  const getFakeTimersExtension = ({ ctx }: { ctx: BackendCtx }) =>
    Prisma.defineExtension((prisma) =>
      !ctx.env.isTestNodeEnv
        ? prisma
        : prisma.$extends({
            query: {
              $allModels: {
                create: async (props) => {
                  const now = new Date()
                  if (Prisma0Models.namesWithCreatedAt.includes(props.model)) {
                    ;(props.args.data as any).createdAt ??= now
                  }
                  if (Prisma0Models.namesWithUpdatedAt.includes(props.model)) {
                    ;(props.args.data as any).updatedAt ??= now
                  }
                  return props.query(props.args)
                },
                update: async (props) => {
                  const now = new Date()
                  if (Prisma0Models.namesWithUpdatedAt.includes(props.model)) {
                    ;(props.args.data as any).updatedAt ??= now
                  }
                  return props.query(props.args)
                },
                createMany: async (props) => {
                  const now = new Date()
                  if (Prisma0Models.namesWithCreatedAt.includes(props.model)) {
                    if (Array.isArray(props.args.data)) {
                      for (const item of props.args.data) {
                        ;(item as any).createdAt ??= now
                      }
                    } else {
                      ;(props.args.data as any).createdAt ??= now
                    }
                  }
                  return props.query(props.args)
                },
              },
            },
          }),
    )

  const getHighLoggingExtension = ({ ctx }: { ctx: BackendCtx }) =>
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
                ctx.logger.info({
                  tag: "high",
                  message: "Successfull request",
                  prismaDurationMs: durationMs,
                  other: {
                    prismaModel: model,
                    prismaOperation: operation,
                    prismaArgs: ctx.env.isLocalHostEnv ? args : "***",
                  },
                })
                return result
              } catch (error) {
                const durationMs = performance.now() - startedAt
                ctx.logger.error({
                  tag: "high",
                  error,
                  meta: {
                    model,
                    operation,
                    args: ctx.env.isLocalHostEnv ? args : "***",
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

  // https://github.com/prisma/prisma-client-extensions/blob/main/retry-transactions/script.ts
  const retryTransactionsExtension = Prisma.defineExtension((prisma) =>
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
              const isTransactionErrorCode = code === "P2034" || code === "25P02"
              return isTransactionErrorCode
            },
            jitter: "none",
            numOfAttempts: 6,
            timeMultiple: 2,
          })
        },
      } as { $transaction: (typeof prisma)["$transaction"] },
    }),
  )

  export type Client = ReturnType<typeof createClient>
}
