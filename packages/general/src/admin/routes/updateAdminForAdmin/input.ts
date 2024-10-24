import { zAdminPermission } from '@/general/src/auth/can.js'
import { zEmailRequired, zStringRequired } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zUpdateAdminForAdminEndpointInput = z.object({
  adminId: zStringRequired,
  email: zEmailRequired,
  name: zStringRequired,
  permissions: zAdminPermission.array(),
  banned: z.boolean(),
})
