import { HonoRouteModel } from "@shmoject/backend/lib/hono.model"
import z from "zod"

export const helloHonoRouteModel = HonoRouteModel.defineModel({
  query: z.object({
    name: z.string().optional().default("world"),
  }),
  response: z.object({
    message: z.string(),
  }),
})
