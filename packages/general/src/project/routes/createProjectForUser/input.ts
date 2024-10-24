import { zStringRequired } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zCreateProjectForUserEndpointInput = z.object({
  name: zStringRequired,
})
