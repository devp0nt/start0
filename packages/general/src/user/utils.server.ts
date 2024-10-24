import type { Prisma, User } from '@/backend/src/services/other/prisma.js'
import { pick } from 'svag-utils'

export const includesUserWithEverything = {} satisfies Prisma.UserInclude
export type UserWithEverything = Prisma.UserGetPayload<{
  include: typeof includesUserWithEverything
}>

export const toClientUserPublic = (admin: User) => {
  return pick(admin, ['id', 'sn'])
}
export type ClientUserPublic = ReturnType<typeof toClientUserPublic>

export const toClientUserForAdmin = (user: UserWithEverything) => {
  return {
    ...pick(user, [
      'id',
      'sn',
      'createdAt',
      'updatedAt',
      'email',
      'id',
      'name',
      'bannedAt',
      'banReason',
      'permissions',
    ]),
  }
}

export type ClientUserForAdmin = ReturnType<typeof toClientUserForAdmin>
