import { zPermissions } from '@auth/shared/permissions'
import { AdminUserSchema, MemberUserSchema, UserSchema } from '@prisma/shared/generated/zod/schemas'
import type * as z from 'zod'

// admin

export const zUser = UserSchema.pick({
  id: true,
  sn: true,
  createdAt: true,
  updatedAt: true,
  banned: true,
  banExpires: true,
  banReason: true,
  email: true,
  emailVerified: true,
  image: true,
  name: true,
  permissions: true,
  role: true,
}).extend({
  permissions: zPermissions,
  role: UserSchema.shape.role.meta({ 'x-ui:form-widget': 'radio' }),
})
export const zMemberUser = MemberUserSchema.pick({ userId: true })
export const zAdminUser = AdminUserSchema.pick({ userId: true })

export const zAdminClientAdmin = zUser.extend({})
export type AdminClientAdmin = z.infer<typeof zAdminClientAdmin>

export const zMemberClientAdmin = zUser.extend({})
export type MemberClientAdmin = z.infer<typeof zMemberClientAdmin>

export const zUserClientAdmin = zUser.extend({
  adminUser: zAdminUser.nullable(),
  memberUser: zMemberUser.nullable(),
})
export type UserClientAdmin = z.infer<typeof zUserClientAdmin>
