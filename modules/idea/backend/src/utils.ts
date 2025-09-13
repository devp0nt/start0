import { pick } from "@devp0nt/lodash0"
import type { IdeaModel } from "@prisma0/backend/generated/prisma/models"

export namespace IdeaBe {
  export const toClient = (idea: IdeaModel) => {
    return {
      ...pick(idea, ["id", "title", "description"]),
    }
  }
  export type Client = ReturnType<typeof toClient>
}
