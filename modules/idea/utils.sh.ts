import type { IdeaModel } from "@shmoject/modules/prisma/prisma0.be"
import { Route } from "@typed/route"

export namespace Idea {
  export type Client = IdeaModel

  export const baseRoute = Route.parse("/ideas")
}
