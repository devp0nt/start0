import { z } from 'zod'

export const zGetProjectForUserEndpointInput = z.object({
  projectSn: z.number(),
})
