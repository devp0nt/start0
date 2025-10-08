// import { zPermissions } from './permissions'
import { AdminUserSchema, MemberUserSchema, UserSchema } from '@prisma0/shared/generated/zod/schemas'
import { z } from 'zod'

export const zMeUser = UserSchema.extend({
  // permissions: zPermissions,
  permissions: z.any(),
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
