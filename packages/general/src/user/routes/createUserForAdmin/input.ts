import { zUserPermission } from '@/general/src/auth/can.js'
import { zEmailRequired, zStringOptionalNullable } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zCreateUserForAdminEndpointInput = z.object({
  email: zEmailRequired,
  name: zStringOptionalNullable,
  permissions: zUserPermission.array(),
})
