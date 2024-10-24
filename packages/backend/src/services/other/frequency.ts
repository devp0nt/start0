import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { logger } from '@/backend/src/services/other/logger.js'
import type { TrpcContext } from '@/backend/src/services/other/trpc.js'
import { isTestEnv } from '@/backend/src/test/helpers/testEnv.js'
import { ErroryExpected, ErroryUnexpected } from '@/general/src/other/errory.js'
import type { Prisma } from '@prisma/client'
import { differenceInMinutes, subMinutes } from 'date-fns'
import _ from 'lodash'
import { plural } from 'svag-utils'

export const createFrequencyLog = async ({
  procedureName,
  ctx,
  userId,
  adminId,
  phone,
  email,
}: {
  procedureName: string
  ctx: TrpcContext
  userId?: string
  adminId?: string
  phone?: string
  email?: string
}) => {
  await ctx.prisma.frequencyLog.create({
    data: {
      userId,
      adminId,
      procedureName,
      ip: ctx.clientData.ip,
      email,
      phone,
    },
  })
}

type CheckAvailabilityByFrequencyInput = {
  ctx: TrpcContext
  procedureName: string
  limitMinutes: number
  limitWhere?: Prisma.FrequencyLogWhereInput
  limitCount?: number
  maxPerUserId?: number
  userId?: string
  adminId?: string
  maxPerPhone?: number
  phone?: string
  maxPerEmail?: number
  email?: string
  maxPerIp?: number
}
export const checkAvailabilityByFrequency = async ({
  ctx,
  procedureName,
  limitCount,
  limitMinutes,
  limitWhere,
  ...restProps
}: CheckAvailabilityByFrequencyInput) => {
  let specificFiltersExists = false
  if ('maxPerUserId' in restProps) {
    if (!restProps.userId && !restProps.adminId) {
      throw new ErroryUnexpected('userId or adminId required')
    }
    specificFiltersExists = true
    await checkAvailabilityByFrequency({
      ctx,
      limitCount: restProps.maxPerUserId,
      limitMinutes,
      procedureName,
      limitWhere: {
        ...limitWhere,
        ...(restProps.userId && {
          userId: restProps.userId,
        }),
        ...(restProps.adminId && {
          adminId: restProps.adminId,
        }),
      },
    })
  }
  if ('maxPerPhone' in restProps) {
    if (!restProps.phone) {
      throw new ErroryUnexpected('phone is required')
    }
    specificFiltersExists = true
    await checkAvailabilityByFrequency({
      ctx,
      limitCount: restProps.maxPerPhone,
      limitMinutes,
      procedureName,
      limitWhere: {
        ...limitWhere,
        phone: restProps.phone,
      },
    })
  }
  if ('maxPerEmail' in restProps) {
    if (!restProps.email) {
      throw new ErroryUnexpected('email is required')
    }
    specificFiltersExists = true
    await checkAvailabilityByFrequency({
      procedureName,
      ctx,
      limitCount: restProps.maxPerEmail,
      limitMinutes,
      limitWhere: {
        ...limitWhere,
        email: restProps.email,
      },
    })
  }

  if ('maxPerIp' in restProps) {
    if (ctx.clientData.ip) {
      await checkAvailabilityByFrequency({
        procedureName,
        ctx,
        limitCount: restProps.maxPerIp,
        limitMinutes,
        limitWhere: {
          ...limitWhere,
          ip: ctx.clientData.ip,
        },
      })
    }
  }

  if (!limitCount || !limitWhere) {
    if (!specificFiltersExists) {
      throw new ErroryUnexpected('specific filters are required when limitCount and limitWhere not provided')
    }
    return
  }

  const frequencyLogs = await ctx.prisma.frequencyLog.findMany({
    where: {
      ...limitWhere,
      createdAt: {
        gte: subMinutes(new Date(), limitMinutes),
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
  if (frequencyLogs.length >= limitCount) {
    const firstRequestDate = frequencyLogs[0].createdAt
    const minutesLeftFromFirstDate = differenceInMinutes(new Date(), firstRequestDate)
    const minutesLeft = limitMinutes - minutesLeftFromFirstDate || 1
    throw new ErroryExpected(
      `You are sending requests too often. Try again in approximately ${plural(minutesLeft, [
        'minute',
        'minutes',
        'minutes',
      ])}`
    )
  }
}

export const handleFrequencyChecker = async ({
  ctx,
  procedureName,
  limitMinutes,
  ...restProps
}: CheckAvailabilityByFrequencyInput) => {
  if (isTestEnv()) {
    return
  }
  await checkAvailabilityByFrequency({
    ctx,
    procedureName,
    limitMinutes,
    ...restProps,
  })
  await createFrequencyLog({
    procedureName,
    ctx,
    ..._.pick(restProps, ['userId', 'adminId', 'phone', 'email']),
  })
}

export const workWithFrequencyLogCleaner = ({ ctx }: { ctx: AppContext }) => {
  void (async () => {
    while (true) {
      const pauseDuration = 60_000
      try {
        const result = await ctx.prisma.frequencyLog.deleteMany({
          where: {
            createdAt: {
              lt: subMinutes(new Date(), 60),
            },
          },
        })
        const recordsCount = result.count
        logger.info({
          message: 'Frequency log cleaner succeeded',
          tag: 'frequencyLogCleaner:success',
          meta: {
            recordsCount,
          },
        })
      } catch (error: any) {
        logger.error({
          error,
          tag: 'frequencyLogCleaner:error',
        })
      }
      await new Promise((resolve) => setTimeout(resolve, pauseDuration))
    }
  })()
}
