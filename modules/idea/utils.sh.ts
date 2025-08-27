import type { IdeaModel } from "@shmoject/modules/prisma/prisma0.be"
import { Route } from "@typed/route"
import z from "zod"

export namespace Idea {
  export type Client = IdeaModel

  export const baseRoute = Route.parse("/ideas")

  export const zLog = z.object({
    date: z.string(),
    message: z.string(),
  })
  export const zLogs = z.array(zLog)
}
