import type { IdeaBe } from "@shmoject/modules/idea/utils.be"
import { Route } from "@typed/route"

export namespace Idea {
  export type Client = IdeaBe.Idea

  export const baseRoute = Route.parse("/ideas")
}
