import z from 'zod'

export const zIdeaShowInput = z.object({
  ideaSn: z.coerce.number(),
})
