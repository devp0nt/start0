import type { Idea as IdeaPrisma } from "@shmoject/modules/prisma/prisma0.be"
import { Route } from "@typed/route"

export namespace Idea {
  export type Client = IdeaPrisma

  export const baseRoute = Route.parse("/ideas")
}
