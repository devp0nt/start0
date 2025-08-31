import { OpenAPIHono } from "@hono/zod-openapi"
import type { BackendCtx } from "@ideanick/backend/lib/ctx"
import { HonoReqCtx } from "@ideanick/backend/lib/ctx.hono"
import { Error0 } from "@ideanick/modules/lib/error0.sh"
import type { Context as HonoContext } from "hono"
import { getConnInfo } from "hono/bun"

export namespace HonoApp {
  type HonoCtxInput = {
    Variables: { honoReqCtx: HonoReqCtx } & HonoReqCtx.Unextendable
  }
  export type HonoCtx = HonoContext<HonoCtxInput>

  export const create = ({ backendCtx }: { backendCtx: BackendCtx }) => {
    const honoApp = new OpenAPIHono<HonoCtxInput>()
    honoApp.use(async (honoCtx, next) => {
      const honoReqCtx = await HonoReqCtx.create({
        backendCtx,
        honoCtx,
      })
      honoCtx.set("honoReqCtx", honoReqCtx)
      const unextendable = honoReqCtx.getUnextendable()
      for (const [key, value] of Object.entries(unextendable)) {
        honoCtx.set(key as keyof HonoReqCtx.Unextendable, value)
      }
      await next()
    })

    return { honoApp }
  }

  export const applyLogging = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.use(async (c, next) => {
      const connInfo = getConnInfo(c)
      c.var.honoReqCtx.meta.assign({
        ip: connInfo.remote.address,
        userAgent: c.req.header("User-Agent"),
        reqMethod: c.req.method,
        reqPath: c.req.path,
      })

      const { logger } = c.var.honoReqCtx.extend("hono:req")
      if (c.req.path.startsWith("/trpc")) {
        await next()
        return
      }
      const reqStartedAt = performance.now()
      try {
        await next()
        logger.info({
          message: "Hono request finished with success",
          reqDurationMs: performance.now() - reqStartedAt,
        })
      } catch (error) {
        logger.error(error, {
          message: "Hono request finished with error",
          reqDurationMs: performance.now() - reqStartedAt,
        })
        throw error
      }
    })
  }

  export const applyErrorHandling = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.onError((error, c) => {
      return c.json(Error0.toJSON(error), 500)
    })
  }

  export type AppType = ReturnType<typeof create>["honoApp"]
}
