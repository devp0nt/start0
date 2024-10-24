import { zPasswordRequired, zStringRequired } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zUpdateMyPasswordForAdminEndpointInput = z.object({
  newPassword: zPasswordRequired,
  oldPassword: zStringRequired,
})
