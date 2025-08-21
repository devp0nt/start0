import { BackendCtx } from "@shmoject/backend/lib/ctx"
import { HonoApp } from "@shmoject/backend/lib/hono"
import { BackendTrpc } from "@shmoject/backend/lib/trpc"
import { BackendHonoRouter } from "@shmoject/backend/router/index.hono"
import { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc"
import { serve } from "bun"
import { cors } from "hono/cors"

export const startApiProcess = async () => {
  const backendCtx = await BackendCtx.create()
  const { honoApp } = HonoApp.create({
    backendCtx,
  })

  honoApp.use(cors())

  BackendHonoRouter.apply({ honoApp })
  BackendTrpc.applyToHonoApp({
    honoApp,
    trpcRouter: BackendTrpcRouter.trpcRouter,
  })

  serve({
    fetch: honoApp.fetch,
    port: process.env.PORT,
  })
  console.info(`Hono is running at http://localhost:${process.env.PORT}`)
}

if (import.meta.main) {
  startApiProcess()
}
