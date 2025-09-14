import { Route0 } from "@devp0nt/route0"
import z from "zod"

export namespace Idea {
  export type Client = any

  export const siteBaseRoute = Route0.create("/ideas")

  export const zLog = z.object({
    date: z.string(),
    message: z.string(),
  })
  export type Log = z.infer<typeof zLog>
  export const zLogs = z.array(zLog)
  export type Logs = z.infer<typeof zLogs>
}
