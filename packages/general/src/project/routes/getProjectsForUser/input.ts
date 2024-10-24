import { z } from 'zod'

export const zGetProjectsForUserEndpointInput = z.object({
  cursor: z.number().optional().nullable(),
  limit: z.number().int().positive().default(10),
})
