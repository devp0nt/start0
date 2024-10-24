import { zStringRequired } from '@/general/src/other/validation.js'
import { z } from 'zod'

export const zUpdateProjectForUserEndpointInput = z.object({
  projectId: zStringRequired,
  name: zStringRequired,
})
