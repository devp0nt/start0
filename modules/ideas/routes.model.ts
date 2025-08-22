import z from "zod"

export namespace IdeasRoutesModel {
  export const zGetIdeaInput = z.object({
    ideaId: z.coerce.number(),
  })
}
