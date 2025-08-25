import z from "zod"

export const zGetIdeaInput = z.object({
  ideaId: z.coerce.number(),
})
