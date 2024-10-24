import { z } from 'zod'

export const zGetAdminForAdminEndpointInput = z.object({
  adminSn: z.number(),
})
