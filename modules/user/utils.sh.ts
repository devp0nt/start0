import { zPermissions } from '@auth/shared/permissions'
import { UserSchema } from '@prisma/shared/generated/zod/schemas'
import type * as z from 'zod'

// admin

const zUser = UserSchema.pick({
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

export const zAdminClientAdmin = zUser.extend({})
export type AdminClientAdmin = z.infer<typeof zAdminClientAdmin>

export const zMemberClientAdmin = zUser.extend({})
export type MemberClientAdmin = z.infer<typeof zMemberClientAdmin>

// me

export const zAdminClientMe = zUser.extend({})
export type AdminClientMe = z.infer<typeof zAdminClientMe>

export const zMemberClientMe = zUser.extend({})
export type MemberClientMe = z.infer<typeof zMemberClientMe>

export const zUserClientMe = zUser.extend({
  memberUser: zMemberClientMe,
  adminUser: zAdminClientMe.nullable(),
})
export type UserClientMe = z.infer<typeof zUserClientMe>

export type MeAuthorized = {
  admin: AdminClientMe | null
  member: MemberClientMe
  user: UserClientMe
}
export type MeUnauthorized = {
  user: null
  admin: null
  member: null
}
export type Me = MeAuthorized | MeUnauthorized
