import { omit, parseZod } from '@apps/shared/utils'
import { withFinalPermissions } from '@auth/shared/permissions'
import {
  zAdminClientAdmin,
  zAdminClientMe,
  zCustomerClientAdmin,
  zCustomerClientMe,
  zUserClientMe,
  type AdminClientAdmin,
  type AdminClientMe,
  type CustomerClientAdmin,
  type CustomerClientMe,
  type UserClientMe,
} from '@auth/shared/user'
import type { BackendCtx } from '@backend/core/ctx'
import type { Prisma } from '@prisma/backend'

// adminUser

export const includesAdminUserWithEverything = {
  user: true,
} satisfies Prisma.AdminUserInclude
export type AdminUserWithEverything = Prisma.AdminUserGetPayload<{
  include: typeof includesAdminUserWithEverything
}>

function toAdminOne(data: AdminUserWithEverything) {
  return withFinalPermissions({
    ...omit(data, ['user']),
    ...data.user,
  })
}
export type Admin = ReturnType<typeof toAdminOne>
export function toAdmin(data: AdminUserWithEverything): Admin
export function toAdmin(data: AdminUserWithEverything[]): Admin[]
export function toAdmin(data: AdminUserWithEverything | AdminUserWithEverything[]) {
  return Array.isArray(data) ? data.map(toAdminOne) : toAdminOne(data)
}

function toAdminClientAdminOne(data: Admin): AdminClientAdmin {
  return parseZod(zAdminClientAdmin, data)
}
export function toAdminClientAdmin(data: Admin): AdminClientAdmin
export function toAdminClientAdmin(data: Admin[]): AdminClientAdmin[]
export function toAdminClientAdmin(data: Admin | Admin[]): AdminClientAdmin | AdminClientAdmin[] {
  return Array.isArray(data) ? data.map(toAdminClientAdminOne) : toAdminClientAdminOne(data)
}

// customerUser

export const includesCustomerUserWithEverything = {
  user: true,
} satisfies Prisma.CustomerUserInclude
export type CustomerUserWithEverything = Prisma.CustomerUserGetPayload<{
  include: typeof includesCustomerUserWithEverything
}>

function toCustomerOne(data: CustomerUserWithEverything) {
  return withFinalPermissions({
    ...omit(data, ['user']),
    ...data.user,
  })
}
export type Customer = ReturnType<typeof toCustomerOne>
export function toCustomer(data: CustomerUserWithEverything): Customer
export function toCustomer(data: CustomerUserWithEverything[]): Customer[]
export function toCustomer(data: CustomerUserWithEverything | CustomerUserWithEverything[]) {
  return Array.isArray(data) ? data.map(toCustomerOne) : toCustomerOne(data)
}

function toCustomerClientAdminOne(data: Customer): CustomerClientAdmin {
  return parseZod(zCustomerClientAdmin, data)
}
export function toCustomerClientAdmin(data: Customer): CustomerClientAdmin
export function toCustomerClientAdmin(data: Customer[]): CustomerClientAdmin[]
export function toCustomerClientAdmin(data: Customer | Customer[]): CustomerClientAdmin | CustomerClientAdmin[] {
  return Array.isArray(data) ? data.map(toCustomerClientAdminOne) : toCustomerClientAdminOne(data)
}

// user

export const includesUserWithEverything = {
  customerUser: true,
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
  customer: Customer
  admin: Admin | null
}> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: includesUserWithEverything,
  })
  const ensureCustomerUser = await (async () => {
    if (user.customerUser) {
      return user.customerUser
    }
    return await prisma.customerUser.create({
      data: {
        userId: user.id,
      },
    })
  })()
  const ensureAdminUser = await (async () => {
    if (user.adminUser || user.role === 'customer') {
      return user.adminUser
    }
    return await prisma.adminUser.create({
      data: {
        userId: user.id,
      },
    })
  })()
  return {
    user: { ...user, customerUser: ensureCustomerUser, adminUser: ensureAdminUser },
    customer: toCustomer({ ...ensureCustomerUser, user }),
    admin: ensureAdminUser ? toAdmin({ ...ensureAdminUser, user }) : null,
  }
}

// me

export function toUserClientMe(data: UserWithEverything): UserClientMe
export function toUserClientMe(data: null): null
export function toUserClientMe(data: UserWithEverything | null): UserClientMe | null
export function toUserClientMe(data: UserWithEverything | null): UserClientMe | null {
  return !data ? null : parseZod(zUserClientMe, withFinalPermissions(data))
}

export function toAdminClientMe(data: Admin): AdminClientMe
export function toAdminClientMe(data: null): null
export function toAdminClientMe(data: Admin | null): AdminClientMe | null
export function toAdminClientMe(data: Admin | null): AdminClientMe | null {
  return !data ? null : parseZod(zAdminClientMe, data)
}

export function toCustomerClientMe(data: Customer): CustomerClientMe
export function toCustomerClientMe(data: null): null
export function toCustomerClientMe(data: Customer | null): CustomerClientMe | null
export function toCustomerClientMe(data: Customer | null): CustomerClientMe | null {
  return !data ? null : parseZod(zCustomerClientMe, data)
}
