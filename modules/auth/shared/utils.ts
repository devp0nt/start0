import { zMemberUser, zAdminUser, zUser } from '@user/shared/utils.sh'
import type * as z from 'zod'

export const zAdminClientMe = zUser.extend({})
export type AdminClientMe = z.infer<typeof zAdminClientMe>

export const zMemberClientMe = zUser.extend({})
export type MemberClientMe = z.infer<typeof zMemberClientMe>

export const zUserClientMe = zUser.extend({
  memberUser: zMemberUser.nullable(),
  adminUser: zAdminUser.nullable(),
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
