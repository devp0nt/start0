import { z } from 'zod'

export const zGetActionLogsForAdminEndpointInput = z.object({
  projectId: z.string().optional().nullable(),
  cursor: z.number().optional().nullable(),
  limit: z.number().int().positive().default(10),
})
