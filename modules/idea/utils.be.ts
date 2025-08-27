import { pick } from "@shmoject/modules/lib/lodash0.sh"
import type { IdeaModel } from "@shmoject/modules/prisma/prisma0.be"

export namespace IdeaBe {
  export const toClient = (idea: IdeaModel) => {
    return {
      ...pick(idea, ["id", "title", "description"]),
    }
  }
  export type Client = ReturnType<typeof toClient>
}
