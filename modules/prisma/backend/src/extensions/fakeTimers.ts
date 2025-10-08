import {
  prismaModelsNamesWithCreatedAt,
  prismaModelsNamesWithUpdatedAt,
} from '@prisma/shared/src/generated/custom/utils'
import { Prisma } from '../generated/prisma/client'

export const getFakeTimersExtension = ({ isTestNodeEnv }: { isTestNodeEnv: boolean }) =>
  Prisma.defineExtension((prisma) =>
    !isTestNodeEnv
      ? prisma
      : prisma.$extends({
          query: {
            $allModels: {
              create: async (props) => {
                const now = new Date()
                if (prismaModelsNamesWithCreatedAt.includes(props.model)) {
                  ;(props.args.data as any).createdAt ??= now
                }
                if (prismaModelsNamesWithUpdatedAt.includes(props.model)) {
                  ;(props.args.data as any).updatedAt ??= now
                }
                return await props.query(props.args)
              },
              update: async (props) => {
                const now = new Date()
                if (prismaModelsNamesWithUpdatedAt.includes(props.model)) {
                  ;(props.args.data as any).updatedAt ??= now
                }
                return await props.query(props.args)
              },
              createMany: async (props) => {
                const now = new Date()
                if (prismaModelsNamesWithCreatedAt.includes(props.model)) {
                  if (Array.isArray(props.args.data)) {
                    for (const item of props.args.data) {
                      ;(item as any).createdAt ??= now
                    }
                  } else {
                    ;(props.args.data as any).createdAt ??= now
                  }
                }
                return await props.query(props.args)
              },
            },
          },
        }),
  )
