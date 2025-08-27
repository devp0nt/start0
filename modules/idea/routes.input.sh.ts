import z from "zod"

export const zGetIdeaInput = z.object({
  ideaSn: z.coerce.number(),
})
