import { trpcRouter } from '@/backend/src/router/trpc/index.js'
import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { clearDb } from '@/backend/src/services/other/prisma.js'
import { createTrpcCallerFactory, getTrpcContext } from '@/backend/src/services/other/trpc.js'
import { actions } from '@/backend/src/test/helpers/actions.js'
import { throwIfNotTestEnv } from '@/backend/src/test/helpers/testEnv.js'
import type { ExpressRequest, ExpressResponse } from '@/backend/src/types/other.js'
import { ErroryUnexpected } from '@/general/src/other/errory.js'
import { jest } from '@jest/globals'
import type { Admin, User } from '@prisma/client'
import { addDays, addMinutes, addSeconds, formatDate } from 'date-fns'
import { parse as parseDate } from 'date-fns/parse'
import _ from 'lodash'

export const toUTC = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1_000)
}

type PrismaWithModelsOnly = Omit<
  AppContext['prisma'],
  | '$transaction'
  | '$queryRawUnsafe'
  | '$queryRaw'
  | '$on'
  | '$extends'
  | '$executeRawUnsafe'
  | '$executeRaw'
  | '$disconnect'
  | '$connect'
  | '$use'
  | symbol
>
type PrismaModelName = keyof PrismaWithModelsOnly
type PrismaModel = AppContext['prisma'][PrismaModelName]
type RecordIdentifier = { id: string } | string

const withoutNoize = (input: any): any => {
  if (_.isArray(input)) {
    return input.map((item) => withoutNoize(item))
  }
  if (_.isObject(input)) {
    return _.entries(input).reduce((acc, [key, value]: [string, any]) => {
      if ([/^id$/, /Id$/, /At$/].some((regex) => regex.test(key))) {
        return acc
      }
      return {
        ...acc,
        [key]: withoutNoize(value),
      }
    }, {})
  }
  return input
}

const createTrpcCaller = createTrpcCallerFactory(trpcRouter)

const getTrpcCaller = ({ ctx, user, admin }: { ctx: AppContext; user?: User; admin?: Admin }) => {
  const req = { me: { user, admin }, clientData: { ip: '0.0.0.0' } } as never as ExpressRequest
  const res = { cookie: () => {} } as never as ExpressResponse
  return createTrpcCaller(getTrpcContext({ appContext: ctx, req, res }))
}
export type TrpcCaller = ReturnType<typeof getTrpcCaller>

const getRecord = async <T extends PrismaModel>(
  model: T,
  recordIdentifier: RecordIdentifier
): Promise<NonNullable<Awaited<ReturnType<T['findUnique']>>>> => {
  const id =
    typeof recordIdentifier === 'string' ? recordIdentifier : 'id' in recordIdentifier ? recordIdentifier.id : undefined
  if (!id) {
    throw new ErroryUnexpected('No id in recordIdentifier')
  }
  const record = await (model as any).findUnique({ where: { id } })
  if (!record) {
    throw new ErroryUnexpected('Record not found')
  }
  return record
}
type GetSpecificRecordFn<T extends PrismaModel> = (
  recordIdentifier: RecordIdentifier
) => Promise<NonNullable<Awaited<ReturnType<T['findUnique']>>>>
const createGetSpecificRecordFn = <T extends PrismaModel>(ctx: AppContext, model: T) => {
  return async (recordIdentifier: RecordIdentifier) => await getRecord(model, recordIdentifier)
}
const getGetSpecificRecordFns = (ctx: AppContext) => {
  const specificGetRecordsFns: any = {}
  for (const [maybeModelName, maybeModel] of Object.entries(ctx.prisma)) {
    if (typeof maybeModel === 'object' && 'findUnique' in maybeModel) {
      specificGetRecordsFns[maybeModelName] = createGetSpecificRecordFn(ctx, maybeModel)
    }
  }
  return {
    ...specificGetRecordsFns,
  } as {
    [K in keyof PrismaWithModelsOnly]: GetSpecificRecordFn<PrismaWithModelsOnly[K]>
  }
}
const setDate = (date: Date | string) => {
  const realDate = date instanceof Date ? date : toUTC(parseDate(date, 'yyyy-MM-dd', new Date()))
  jest
    .useFakeTimers({
      doNotFake: [
        'nextTick',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    })
    .setSystemTime(realDate)
}

const waitDays = (days: number) => {
  setDate(addDays(new Date(), days))
}

const waitSecs = (secs: number) => {
  setDate(addSeconds(new Date(), secs))
}

const waitMins = (mins: number) => {
  setDate(addMinutes(new Date(), mins))
}

const getDate = (date?: Date | string) => {
  if (!date) {
    return new Date()
  }
  const realDate = date instanceof Date ? date : toUTC(parseDate(date, 'yyyy-MM-dd', new Date()))
  return realDate
}

const getStringDate = (date?: Date | string) => {
  const realDate = getDate(date)
  return formatDate(realDate, 'dd.MM.yyyy')
}

const log = (...args: any[]) => {
  if (args.length === 0) {
    return
  }
  if (args.length === 1) {
    // eslint-disable-next-line no-console
    console.dir(args[0], { depth: null })
    return
  }
  // eslint-disable-next-line no-console
  console.dir(args, { depth: null })
}

const exists = <T>(value: T): NonNullable<T> => {
  if (!value) {
    throw new ErroryUnexpected('Falsy value')
  }
  return value
}

const getIndexByName = (nameOrObjectWithName: string | { name: string }) => {
  const name = typeof nameOrObjectWithName === 'string' ? nameOrObjectWithName : nameOrObjectWithName.name
  const parts = name.split(' ')
  const lastPart = parts[parts.length - 1]
  if (!lastPart) {
    throw new Error(`Invalid name: ${name}`)
  }
  const index = +lastPart
  if (isNaN(index)) {
    throw new Error(`Invalid name: ${name}`)
  }
  return index
}

const waitForWorkers = async (ctx: AppContext) => {
  await Promise.all([])
}

export const getIntegrationTestUtils = (ctx: AppContext) => {
  throwIfNotTestEnv()
  return {
    env: ctx.env,
    getTrpcCaller: (props?: { user?: User; admin?: Admin }) =>
      getTrpcCaller({
        ctx,
        user: props?.user,
        admin: props?.admin,
      }),
    clearDb: async () => {
      await clearDb(ctx.prisma)
    },
    a: actions,
    get: getGetSpecificRecordFns(ctx),
    exists,
    setDate,
    getIndexByName,
    waitDays,
    waitMins,
    waitSecs,
    waitForWorkers: async () => {
      await waitForWorkers(ctx)
    },
  }
}

export const getUnitTestUtils = () => {
  throwIfNotTestEnv()
  return {
    withoutNoize,
    getDate,
    getStringDate,
    log,
  }
}

export const getAllTestUtils = (ctx: AppContext) => {
  return {
    ...getIntegrationTestUtils(ctx),
    ...getUnitTestUtils(),
  }
}

export type TestUtils = ReturnType<typeof getAllTestUtils>
