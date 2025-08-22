import { BackendCtx } from "@shmoject/backend/lib/ctx"
import { HonoApp } from "@shmoject/backend/lib/hono"
import { BackendTrpc } from "@shmoject/backend/lib/trpc"
import { BackendHonoRouter } from "@shmoject/backend/router/index.hono"
import { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc"
import { serve } from "bun"
import { cors } from "hono/cors"

export const startApiProcess = async () => {
  const ctx = await BackendCtx.create({
    service: "api",
  })
  const { honoApp } = HonoApp.create({
    backendCtx: ctx,
  })

  honoApp.use(cors())
  HonoApp.applyLogging({ honoApp })
  HonoApp.applyErrorHandling({ honoApp })

  BackendHonoRouter.apply({ honoApp })
  BackendTrpc.applyToHonoApp({
    honoApp,
    trpcRouter: BackendTrpcRouter.trpcRouter,
  })

  serve({
    fetch: honoApp.fetch,
    port: process.env.PORT,
  })
  ctx.logger.info(`Hono is running at http://localhost:${process.env.PORT}`)
}

if (import.meta.main) {
  startApiProcess()
}
