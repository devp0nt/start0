import type { Admin, Prisma } from '@/backend/src/services/other/prisma.js'
import { pick } from 'svag-utils'

export const includesAdminWithEverything = {} satisfies Prisma.AdminInclude
export type AdminWithEverything = Prisma.AdminGetPayload<{
  include: typeof includesAdminWithEverything
}>

export const toClientAdminPublic = (admin: Admin) => {
  return pick(admin, ['id', 'sn'])
}
export type ClientAdminPublic = ReturnType<typeof toClientAdminPublic>

export const toClientAdminForAdmin = (admin: Admin) => {
  return pick(admin, ['id', 'sn', 'bannedAt', 'banReason', 'name', 'email', 'permissions'])
}
export type ClientAdminForAdmin = ReturnType<typeof toClientAdminForAdmin>
