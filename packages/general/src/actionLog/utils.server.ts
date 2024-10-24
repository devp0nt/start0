import { logger } from '@/backend/src/services/other/logger.js'
import type { ActionLogActorType, Admin, Project, Prisma, User } from '@/backend/src/services/other/prisma.js'
import type { AnyContext } from '@/backend/src/types/ctx.js'
import type { ActionLogAction } from '@/general/src/actionLog/utils.shared.js'
import { integerWithDecimalsToAmountString } from '@/general/src/other/money.js'
import { detailedDiff } from 'deep-object-diff'
import _ from 'lodash'
import { deepMap } from 'svag-deep-map'
import { pick } from 'svag-utils'

export const includesActionLogWithEverything = {
  admin: true,
  user: true,
  project: true,
} satisfies Prisma.ActionLogInclude
export type ActionLogWithEverything = Prisma.ActionLogGetPayload<{
  include: typeof includesActionLogWithEverything
}>

export const toClientActionLog = (actionLog: ActionLogWithEverything) => {
  const admin = actionLog.admin
    ? {
        id: actionLog.admin.id,
        sn: actionLog.admin.sn,
        name: actionLog.admin.name,
      }
    : null
  const user = actionLog.user
    ? {
        id: actionLog.user.id,
        sn: actionLog.user.sn,
        name: actionLog.user.name,
      }
    : null
  return {
    ...pick(actionLog, ['id', 'actorType', 'sn', 'createdAt', 'action', 'ip']),
    data:
      typeof actionLog.data === 'object'
        ? deepMap(actionLog.data, ({ key, value }) => {
            if (!['Amount', 'amount', 'balance', 'Balance'].includes(key)) {
              return value
            }
            if (typeof value === 'bigint') {
              return integerWithDecimalsToAmountString({ amount: value })
            }
            return value
          })
        : actionLog.data,
    ...(actionLog.descripton && { descripton: actionLog.descripton }),
    actor: actionLog.actorType === 'admin' ? admin : actionLog.actorType === 'user' ? user : null,
    // ...(admin && actionLog.actorType !== 'admin' && { admin }),
    // ...(user && actionLog.actorType !== 'user' && { user }),
    ...(admin && { admin }),
    ...(user && { user }),
    ...(actionLog.project && {
      project: {
        id: actionLog.project.id,
        sn: actionLog.project.sn,
        name: actionLog.project.name,
      },
    }),
  }
}
export type ClientActionLog = ReturnType<typeof toClientActionLog>

type ActionLogInput = {
  ctx: AnyContext
  action: ActionLogAction
  actorType: ActionLogActorType
  admin?: Admin | null
  adminId?: string
  user?: User | null
  userId?: string
  projectId?: string
  project?: Project | null
}

export const getDiff = <T extends Record<string, any>>(
  originalObj: T,
  updatedObj: T,
  pickKeys?: Array<keyof T>,
  omitKeys?: Array<keyof T>
) => {
  const pickedOriginalObj = pickKeys ? _.pick(originalObj, pickKeys) : originalObj
  const pickedUpdatedObj = pickKeys ? _.pick(updatedObj, pickKeys) : updatedObj
  const omittedOriginalObj = omitKeys ? _.omit(pickedOriginalObj, omitKeys) : pickedOriginalObj
  const omittedUpdatedObj = omitKeys ? _.omit(pickedUpdatedObj, omitKeys) : pickedUpdatedObj
  const normalizedOriginalObj = _.omit(omittedOriginalObj, ['updatedAt'])
  const normalizedUpdatedObj = _.omit(omittedUpdatedObj, ['updatedAt'])
  const fullDiff = detailedDiff(normalizedOriginalObj, normalizedUpdatedObj)
  const diff = {
    ...(Object.getOwnPropertyNames(fullDiff.added).length ? { added: fullDiff.added } : {}),
    ...(Object.getOwnPropertyNames(fullDiff.deleted).length ? { deleted: fullDiff.deleted } : {}),
    ...(Object.getOwnPropertyNames(fullDiff.updated).length ? { updated: fullDiff.updated } : {}),
  }
  const isDiffEmpty = Object.getOwnPropertyNames(diff).length === 0
  return {
    diff,
    isDiffEmpty,
  }
}

const getIpAndCountry = (ctx: AnyContext) => {
  return {
    ip: 'clientData' in ctx ? ctx.clientData.ip : null,
    country: 'clientData' in ctx ? ctx.clientData.country : null,
  }
}

const parseActionLogInput = (input: ActionLogInput) => {
  return {
    action: input.action,
    actorType: input.actorType,
    adminId: input.admin?.id || input.adminId,
    userId: input.user?.id || input.userId,
    projectId: input.project?.id || input.projectId,
    ...getIpAndCountry(input.ctx),
  }
}

export const createActionLogByData = async <T extends Record<string, any>>(
  input: {
    data?: T
    pickKeys?: Array<keyof T>
  } & ActionLogInput
) => {
  await input.ctx.prisma.actionLog
    .create({
      data: {
        ...parseActionLogInput(input),
        data: !input.data ? {} : input.pickKeys ? _.pick(input.data, input.pickKeys) : input.data,
      },
    })
    .then((actionLog) => {
      logger.info({ tag: `actionLog:${actionLog.action}`, message: 'New action log', meta: actionLog })
    })
    .catch((error) => {
      logger.error({ tag: 'actionLog', error })
    })
}

// export const createActionLogByDiff = async <T extends Record<string, any>>(
//   input: {
//     prevData: T
//     newData: T
//     pickKeys?: Array<keyof T>
//     extra?: Record<string, any>
//   } & ActionLogInput
// ) => {
//   const { diff, isDiffEmpty } = getDiff(input.prevData, input.newData, input.pickKeys)
//   if (isDiffEmpty) {
//     return undefined
//   }
//   await input.ctx.prisma.actionLog
//     .create({
//       data: {
//         ...parseActionLogInput(input),
//         data: { ...diff, ...input.extra },
//       },
//     })
//     .then((actionLog) => {
//       logger.info({ tag: `action-log:${actionLog.action}`, message: 'New action log', meta: actionLog })
//     })
//     .catch((error) => {
//       logger.error({ tag: 'actionLog', error })
//     })
//   return undefined
// }
