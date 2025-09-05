import { pick } from "@/lib/lodash0.sh"
import type { IdeaModel } from "@/prisma/src/generated.be/prisma/models"

export namespace IdeaBe {
  export const toClient = (idea: IdeaModel) => {
    return {
      ...pick(idea, ["id", "title", "description"]),
    }
  }
  export type Client = ReturnType<typeof toClient>
}
