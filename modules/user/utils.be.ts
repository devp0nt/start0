import { omit } from '@apps/shared/utils'
import type { BackendCtx } from '@backend/core/ctx'
import type { Prisma } from '@prisma/backend/generated/prisma/client'
import {
  zAdminClientAdmin,
  zAdminClientMe,
  zMemberClientAdmin,
  zMemberClientMe,
  zUserClientMe,
  type AdminClientAdmin,
  type AdminClientMe,
  type MemberClientAdmin,
  type MemberClientMe,
  type UserClientMe,
} from '@user/admin/utils.sh'

// adminUser

export const includesAdminUserWithEverything = {
  user: true,
} satisfies Prisma.AdminUserInclude
export type AdminUserWithEverything = Prisma.AdminUserGetPayload<{
  include: typeof includesAdminUserWithEverything
}>

function toAdminOne(data: AdminUserWithEverything) {
  return {
    ...omit(data, ['user']),
    ...data.user,
  }
}
export type Admin = ReturnType<typeof toAdminOne>
export function toAdmin(data: AdminUserWithEverything): Admin
export function toAdmin(data: AdminUserWithEverything[]): Admin[]
export function toAdmin(data: AdminUserWithEverything | AdminUserWithEverything[]) {
  return Array.isArray(data) ? data.map(toAdminOne) : toAdminOne(data)
}

function toAdminClientAdminOne(data: Admin): AdminClientAdmin {
  return zAdminClientAdmin.parse(data)
}
export function toAdminClientAdmin(data: Admin): AdminClientAdmin
export function toAdminClientAdmin(data: Admin[]): AdminClientAdmin[]
export function toAdminClientAdmin(data: Admin | Admin[]): AdminClientAdmin | AdminClientAdmin[] {
  return Array.isArray(data) ? data.map(toAdminClientAdminOne) : toAdminClientAdminOne(data)
}

export function toAdminClientMe(data: Admin): AdminClientMe
export function toAdminClientMe(data: null): null
export function toAdminClientMe(data: Admin | null): AdminClientMe | null
export function toAdminClientMe(data: Admin | null): AdminClientMe | null {
  return !data ? null : zAdminClientMe.parse(data)
}

// memberUser

export const includesMemberUserWithEverything = {
  user: true,
} satisfies Prisma.MemberUserInclude
export type MemberUserWithEverything = Prisma.MemberUserGetPayload<{
  include: typeof includesMemberUserWithEverything
}>

function toMemberOne(data: MemberUserWithEverything) {
  return {
    ...omit(data, ['user']),
    ...data.user,
  }
}
export type Member = ReturnType<typeof toMemberOne>
export function toMember(data: MemberUserWithEverything): Member
export function toMember(data: MemberUserWithEverything[]): Member[]
export function toMember(data: MemberUserWithEverything | MemberUserWithEverything[]) {
  return Array.isArray(data) ? data.map(toMemberOne) : toMemberOne(data)
}

function toMemberClientAdminOne(data: Member): MemberClientAdmin {
  return zMemberClientAdmin.parse(data)
}
export function toMemberClientAdmin(data: Member): MemberClientAdmin
export function toMemberClientAdmin(data: Member[]): MemberClientAdmin[]
export function toMemberClientAdmin(data: Member | Member[]): MemberClientAdmin | MemberClientAdmin[] {
  return Array.isArray(data) ? data.map(toMemberClientAdminOne) : toMemberClientAdminOne(data)
}

export function toMemberClientMe(data: Member): MemberClientMe
export function toMemberClientMe(data: null): null
export function toMemberClientMe(data: Member | null): MemberClientMe | null
export function toMemberClientMe(data: Member | null): MemberClientMe | null {
  return !data ? null : zMemberClientMe.parse(data)
}

// user

export const includesUserWithEverything = {
  memberUser: true,
  adminUser: true,
} satisfies Prisma.UserInclude
export type UserWithEverything = Prisma.UserGetPayload<{
  include: typeof includesUserWithEverything
}>

export const getUser = async (
  { prisma }: Pick<BackendCtx, 'prisma'>,
  userId: string,
): Promise<{
  user: UserWithEverything
  member: Member
  admin: Admin | null
}> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: includesUserWithEverything,
  })
  const ensureMemberUser = await (async () => {
    if (user.memberUser) {
      return user.memberUser
    }
    return await prisma.memberUser.create({
      data: {
        userId: user.id,
      },
    })
  })()
  const ensureAdminUser = await (async () => {
    if (user.adminUser || user.role === 'user') {
      return user.adminUser
    }
    return await prisma.adminUser.create({
      data: {
        userId: user.id,
      },
    })
  })()
  return {
    user: { ...user, memberUser: ensureMemberUser, adminUser: ensureAdminUser },
    member: toMember({ ...ensureMemberUser, user }),
    admin: ensureAdminUser ? toAdmin({ ...ensureAdminUser, user }) : null,
  }
}

export function toUserClientMe(data: UserWithEverything): UserClientMe
export function toUserClientMe(data: null): null
export function toUserClientMe(data: UserWithEverything | null): UserClientMe | null
export function toUserClientMe(data: UserWithEverything | null): UserClientMe | null {
  return !data ? null : zUserClientMe.parse(data)
}
