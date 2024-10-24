import { zAdminPermission } from '@/general/src/auth/can.js'
import { zEmailRequired, zStringRequired } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zCreateAdminForAdminEndpointInput = z.object({
  email: zEmailRequired,
  name: zStringRequired,
  permissions: zAdminPermission.array(),
})
