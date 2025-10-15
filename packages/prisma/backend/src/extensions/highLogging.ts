import { env } from '@backend/base/env.runtime'
import type { ProjectLogger } from '@devp0nt/logger0/adapters/logger0-adapter-project'
import { Prisma } from '../generated/prisma/client'

export const getHighLoggingExtension = ({ logger }: { logger: ProjectLogger }) =>
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
              logger.info({
                tag: 'high',
                message: 'Successfull request',
                prismaDurationMs: durationMs,
                other: {
                  prismaModel: model,
                  prismaOperation: operation,
                  prismaArgs: env.isLocalHostEnv ? args : '***',
                },
              })
              return result
            } catch (error) {
              const durationMs = performance.now() - startedAt
              logger.error({
                tag: 'high',
                error,
                meta: {
                  model,
                  operation,
                  args: env.isLocalHostEnv ? args : '***',
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
