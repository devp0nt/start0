import { HonoApp } from "@shmoject/backend/lib/hono";
import z from "zod";

export const helloRouteModel = HonoApp.defineRouteModel({
  query: z.object({
    name: z.string().optional().default("world"),
  }),
  response: z.object({
    message: z.string(),
  }),
});
