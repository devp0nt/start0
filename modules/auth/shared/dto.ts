import { AdminUserModelSchema, MemberUserModelSchema, UserModelSchema } from '@prisma0/backend/generated/zod/schemas'

export const zMeUser = UserModelSchema.omit({
  // who know may be later, we want to hide some props
})
export const zMeAdmin = AdminUserModelSchema.omit({
  // ...
})
export const zMeMember = MemberUserModelSchema.omit({
  // ...
})
