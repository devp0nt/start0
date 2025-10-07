import { IdeaModelSchema as zRaw } from '@prisma0/backend/generated/zod/schemas'
import type * as z from 'zod'

export const zIdeaClientAdmin = zRaw
  .pick({
    id: true,
    sn: true,
    createdAt: true,
    updatedAt: true,
    title: true,
    description: true,
  })
  .extend({
    description: zRaw.shape.description.meta({ format: 'markdown' }),
  })
export type IdeaClientAdmin = z.infer<typeof zIdeaClientAdmin>

export const zIdeaClientGuest = zIdeaClientAdmin
export type IdeaClientGuest = z.infer<typeof zIdeaClientGuest>
