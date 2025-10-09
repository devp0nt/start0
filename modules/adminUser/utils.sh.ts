import { zPermissions } from '@auth/shared/permissions'
import { UserSchema } from '@prisma/shared/generated/zod/schemas'
import type * as z from 'zod'

export const zAdminUserClientAdmin = UserSchema.pick({
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
export type AdminUserClientAdmin = z.infer<typeof zAdminUserClientAdmin>
