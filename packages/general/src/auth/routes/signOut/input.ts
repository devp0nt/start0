import { z } from 'zod'

export const zSignOutEndpointInput = z.object({
  role: z.enum(['user', 'admin']),
})
