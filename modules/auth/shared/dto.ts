import { AdminUserSchema, MemberUserSchema, UserSchema } from '@prisma0/shared/generated/zod/schemas'
import type { z } from 'zod'
import { zPermissions } from './permissions'

export const zMeUser = UserSchema.extend({
  permissions: zPermissions,
})
export type MeUser = z.infer<typeof zMeUser>
export const zMeAdmin = AdminUserSchema.extend({
  // ...
})
export type MeAdmin = z.infer<typeof zMeAdmin>
export const zMeMember = MemberUserSchema.extend({
  // ...
})
export type MeMember = z.infer<typeof zMeMember>
