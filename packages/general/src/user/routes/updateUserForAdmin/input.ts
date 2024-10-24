import { zUserPermission } from '@/general/src/auth/can.js'
import { zEmailRequired, zStringRequired } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zUpdateUserForAdminEndpointInput = z.object({
  userId: zStringRequired,
  email: zEmailRequired,
  name: zStringRequired,
  permissions: zUserPermission.array(),
  banned: z.boolean(),
})
