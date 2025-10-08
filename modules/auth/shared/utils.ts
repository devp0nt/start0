import { parseZod } from '@apps/shared/utils'
import type { AdminUser, MemberUser, User } from '@prisma/backend/generated/prisma/client'
import { UserSchema } from '@prisma/shared/generated/zod/schemas'
import type { z } from 'zod'
import { zPermissions } from './permissions'

export const zMeAdmin = UserSchema.extend({
  permissions: zPermissions,
  // may be later we will have special props for admins only
})
export type MeAdmin = z.infer<typeof zMeAdmin>
export type MeAdminWithUser = AdminUser & { user: User }
export function toMeAdmin(admin: MeAdminWithUser): MeAdmin
export function toMeAdmin(admin: null): null
export function toMeAdmin(admin: MeAdminWithUser | null): MeAdmin | null
export function toMeAdmin(admin: MeAdminWithUser | null): MeAdmin | null {
  if (!admin) {
    return null
  }
  return parseZod(zMeAdmin, {
    ...admin,
    ...admin.user,
  })
}

export const zMeMember = UserSchema.extend({
  permissions: zPermissions,
  // may be later we will have special props for members only
})
export type MeMember = z.infer<typeof zMeMember>
export type MeMemberWithUser = MemberUser & { user: User }
export function toMeMember(member: MeMemberWithUser): MeMember
export function toMeMember(member: null): null
export function toMeMember(member: MeMemberWithUser | null): MeMember | null
export function toMeMember(member: MeMemberWithUser | null): MeMember | null {
  if (!member) {
    return null
  }
  return parseZod(zMeMember, {
    ...member,
    ...member.user,
  })
}
