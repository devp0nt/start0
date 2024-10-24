import { zEmailRequired, zStringRequired } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zSignInAdminEndpointInput = z.object({
  email: zEmailRequired,
  password: zStringRequired,
})
