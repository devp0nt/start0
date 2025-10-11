import { zPermissions } from '@auth/shared/permissions'
import type * as z from 'zod'

import { AdminUserSchema, CustomerUserSchema, UserSchema } from '@prisma/shared'

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
  specialPermissions: true,
  role: true,
}).extend({
  specialPermissions: zPermissions,
  finalPermissions: zPermissions,
  role: UserSchema.shape.role.meta({ 'x-ui:form-widget': 'radio' }),
})
export const zCustomerUser = CustomerUserSchema.pick({ userId: true })
export const zAdminUser = AdminUserSchema.pick({ userId: true })

export const zAdminClientAdmin = zUser.extend({
  ...zAdminUser.shape,
})
export type AdminClientAdmin = z.infer<typeof zAdminClientAdmin>

export const zCustomerClientAdmin = zUser.extend({
  ...zCustomerUser.shape,
})
export type CustomerClientAdmin = z.infer<typeof zCustomerClientAdmin>

export const zUserClientAdmin = zUser.extend({
  adminUser: zAdminUser.nullable(),
  customerUser: zCustomerUser.nullable(),
})
export type UserClientAdmin = z.infer<typeof zUserClientAdmin>

// me

export const zAdminClientMe = zUser.extend({
  ...zAdminUser.shape,
})
export type AdminClientMe = z.infer<typeof zAdminClientMe>

export const zCustomerClientMe = zUser.extend({
  ...zCustomerUser.shape,
})
export type CustomerClientMe = z.infer<typeof zCustomerClientMe>

export const zUserClientMe = zUser.extend({
  customerUser: zCustomerUser.nullable(),
  adminUser: zAdminUser.nullable(),
})
export type UserClientMe = z.infer<typeof zUserClientMe>

export type MeAuthorized = {
  admin: AdminClientMe | null
  customer: CustomerClientMe
  user: UserClientMe
}
export type MeUnauthorized = {
  user: null
  admin: null
  customer: null
}
export type Me = MeAuthorized | MeUnauthorized
