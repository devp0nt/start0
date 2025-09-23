/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma transaction args are dynamic */
/* eslint-disable @typescript-eslint/no-unsafe-call -- backOff function requires any args */
/* eslint-disable @typescript-eslint/no-unsafe-argument -- Prisma transaction args are dynamic */
/* eslint-disable prefer-spread -- apply method needed for dynamic args */
/* eslint-disable @typescript-eslint/no-unsafe-member-access -- Error object properties are dynamic */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- Error code assignment from dynamic properties */
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Client extension typing requires assertions */
/* eslint-disable @typescript-eslint/consistent-type-assertions -- Mixed assertion styles needed for Prisma types */
import { backOff } from 'exponential-backoff'
import { Prisma } from '../generated/prisma/client'

// https://github.com/prisma/prisma-client-extensions/blob/main/retry-transactions/script.ts
export const retryTransactionsExtension = Prisma.defineExtension((prisma) =>
  prisma.$extends({
    client: {
      $transaction: async (...args: any) => {
        return await backOff(async () => await prisma.$transaction.apply(prisma, args), {
          retry: (e) => {
            const normalCode: string | undefined = e.code
            // parse e.message like this
            // ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "25P02", message: "current transaction is aborted, commands ignored until end of transaction block", severity: "ERROR", detail: None, column: None, hint: None }), transient: false })
            const secretCode: string | undefined = e.message.match(/PostgresError \{ code: "([^"]+)"/)?.[1]
            const code = normalCode || secretCode
            // Retry the transaction only if the error was due to a write conflict or deadlock
            // See: https://www.prisma.io/docs/reference/api-reference/error-reference#p2034
            const isTransactionErrorCode = code === 'P2034' || code === '25P02'
            return isTransactionErrorCode
          },
          jitter: 'none',
          numOfAttempts: 6,
          timeMultiple: 2,
        })
      },
    } as { $transaction: (typeof prisma)['$transaction'] },
  }),
)
