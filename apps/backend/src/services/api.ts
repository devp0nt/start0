import { serve } from "bun"
import { cors } from "hono/cors"
import { BackendCtx } from "@/backend/lib/ctx"
import { HonoApp } from "@/backend/lib/hono"
import { BackendTrpc } from "@/backend/lib/trpc"
import { BackendHonoRouter } from "@/backend/router/index.hono"
import { BackendTrpcRouter } from "@/backend/router/index.trpc"

export const startApiProcess = async () => {
  let ctx: BackendCtx | null = null
  try {
    ctx = await BackendCtx.create({
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
      port: ctx.env.PORT,
    })
    ctx.logger.info(`Hono is running at http://localhost:${ctx.env.PORT}`)
  } catch (e: any) {
    if (ctx) {
      ctx.logger.error(e)
      await ctx.destroy()
    } else {
      // biome-ignore lint/suspicious/noConsole: <fallback to native logger>
      console.dir(
        {
          level: "error",
          message: e.message || "Unknown error",
          service: "backend-api",
          tag: "backend:fatality",
          meta: e.meta,
        },
        { depth: null },
      )
    }
    process.exit(1)
  }
}

if (import.meta.main) {
  void startApiProcess()
}
