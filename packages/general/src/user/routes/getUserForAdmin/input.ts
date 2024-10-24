import { z } from 'zod'

export const zGetUserForAdminEndpointInput = z.object({
  userSn: z.number(),
})
