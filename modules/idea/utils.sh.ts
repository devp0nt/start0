import type * as z from 'zod'
import { IdeaSchema } from '@prisma0/shared/generated/zod/schemas'

export const zIdeaClientAdmin = IdeaSchema.pick({
  id: true,
  sn: true,
  createdAt: true,
  updatedAt: true,
  title: true,
  description: true,
}).extend({
  description: IdeaSchema.shape.description.meta({ format: 'markdown' }),
})
export type IdeaClientAdmin = z.infer<typeof zIdeaClientAdmin>

export const zIdeaClientGuest = zIdeaClientAdmin
export type IdeaClientGuest = z.infer<typeof zIdeaClientGuest>
