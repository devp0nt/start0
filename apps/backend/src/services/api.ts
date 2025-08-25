import { BackendCtx } from "@shmoject/backend/lib/ctx"
import { HonoApp } from "@shmoject/backend/lib/hono"
import { BackendTrpc } from "@shmoject/backend/lib/trpc"
import { BackendHonoRouter } from "@shmoject/backend/router/index.hono"
import { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc"
import { serve } from "bun"
import { cors } from "hono/cors"

export const startApiProcess = async () => {
  try {
    const ctx = await BackendCtx.create({
      meta: {
        service: "backend-api",
        tagPrefix: "backend",
      },
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
  } catch (e: any) {
    // biome-ignore lint/suspicious/noConsole: <fallback to native logger>
    console.error({
      message: e.message || "Unknown error",
      service: "backend-api",
      tag: "backend:fatality",
    })
    process.exit(1)
  }
}

if (import.meta.main) {
  startApiProcess()
}
