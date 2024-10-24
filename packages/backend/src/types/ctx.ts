import type { AppContext } from '@/backend/src/services/other/ctx.js'
import type { CuttedPrisma } from '@/backend/src/services/other/prisma.js'
import type { TrpcContext } from '@/backend/src/services/other/trpc.js'

export type AnyContext =
  | TrpcContext
  | AppContext
  | (Omit<TrpcContext, 'prisma'> & { prisma: CuttedPrisma })
  | (Omit<AppContext, 'prisma'> & { prisma: CuttedPrisma })
