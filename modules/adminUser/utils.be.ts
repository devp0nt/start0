import { omit } from '@apps/shared/utils'
import type { AdminUser, User } from '@prisma/backend/generated/prisma/client'

export type AdminUserWithUser = AdminUser & { user: User }
function toAdminUserServerOne(data: AdminUserWithUser) {
  return {
    ...omit(data, ['user']),
    ...data.user,
  }
}
export type AdminUserServer = ReturnType<typeof toAdminUserServerOne>
export function toAdminUserServer(data: AdminUserWithUser): AdminUserServer
export function toAdminUserServer(data: AdminUserWithUser[]): AdminUserServer[]
export function toAdminUserServer(data: AdminUserWithUser | AdminUserWithUser[]) {
  return Array.isArray(data) ? data.map(toAdminUserServerOne) : toAdminUserServerOne(data)
}
