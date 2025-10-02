import { IdeaSchema as zRaw } from '@prisma0/backend/generated/zod/schemas/models/Idea.schema'

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

export const zIdeaClientUser = zIdeaClientAdmin
