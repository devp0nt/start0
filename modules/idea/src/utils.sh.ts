import { Route } from "@typed/route"
import z from "zod"
import type { IdeaModel } from "@/prisma/src/generated.be/prisma/models"

export namespace Idea {
  export type Client = IdeaModel

  export const siteBaseRoute = Route.parse("/ideas")

  export const zLog = z.object({
    date: z.string(),
    message: z.string(),
  })
  export type Log = z.infer<typeof zLog>
  export const zLogs = z.array(zLog)
  export type Logs = z.infer<typeof zLogs>
}
