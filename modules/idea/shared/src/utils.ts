import { Route0 } from "@devp0nt/route0"
import type { IdeaModel } from "@prisma0/backend/generated/prisma/models"
import z from "zod"

export namespace Idea {
  export type Client = IdeaModel

  export const siteBaseRoute = Route0.create("/ideas")

  export const zLog = z.object({
    date: z.string(),
    message: z.string(),
  })
  export type Log = z.infer<typeof zLog>
  export const zLogs = z.array(zLog)
  export type Logs = z.infer<typeof zLogs>
}
