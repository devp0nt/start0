import {
  createRoute,
  OpenAPIHono,
  type RouteConfig,
  type z,
} from "@hono/zod-openapi"
import type { BackendCtx } from "@shmoject/backend/lib/ctx"
import { HonoReqCtx } from "@shmoject/backend/lib/ctx.hono"
import { HonoRouteModel } from "@shmoject/backend/lib/hono.model"
import { Error0 } from "@shmoject/modules/lib/error0"
import type { Context as HonoContext } from "hono"

export namespace HonoApp {
  export type HonoCtx = HonoContext<{
    Variables: HonoReqCtx
  }>

  export const create = ({ backendCtx }: { backendCtx: BackendCtx }) => {
    const honoApp = new OpenAPIHono<{
      Variables: HonoReqCtx
    }>()

    honoApp.use(async (c, next) => {
      const honoReqCtx = await HonoReqCtx.create({
        backendCtx,
        honoCtx: c,
      })
      for (const [key, value] of Object.entries(honoReqCtx)) {
        c.set(key as keyof HonoReqCtx, value as never)
      }
      await next()
    })

    return { honoApp }
  }

  export const applyLogging = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.use(async (c, next) => {
      if (c.req.path.startsWith("/trpc")) {
        await next()
        return
      }
      const reqStartedAt = performance.now()
      const l = c.var.logger.extend("req")
      l.info({
        message: "Hono request started",
      })
      try {
        await next()
        l.info({
          message: "Hono request finished with success",
          reqDurationMs: performance.now() - reqStartedAt,
        })
      } catch (error) {
        l.error(error, {
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

  export const defineRoute = <
    TMethod extends RouteConfig["method"],
    TPath extends RouteConfig["path"],
    TZQuery extends z.ZodObject | z.ZodAny | undefined = undefined,
    TZResponse extends z.ZodObject | z.ZodAny | undefined = undefined,
    TResponseContentType extends
      | HonoRouteModel.ResponseContentType
      | undefined = undefined,
  >(props0: {
    method: TMethod
    path: TPath
    model?: {
      query?: TZQuery
      response?: TZResponse
      responseContentType?: TResponseContentType
    }
  }) => {
    const model = HonoRouteModel.defineModel(props0.model || {})
    const { method, path } = props0

    const createRoutePropsHere = {
      method,
      path,
      request: {
        ...(model.query && { query: model.query }),
      },
      responses: {
        ...(model.response && {
          200: {
            content: {
              "application/json": {
                schema: model.response,
              },
            },
            description: model.response.description || "Success",
          },
        }),
      },
    }

    const createRouteResult = createRoute(createRoutePropsHere)

    return (
      fn1: (props1: {
        honoApp: AppType
        createRouteProps: typeof createRoutePropsHere
        createRouteResult: typeof createRouteResult
      }) => void,
    ) => {
      return {
        apply: (props: { honoApp: AppType }) => {
          return fn1({
            honoApp: props.honoApp,
            createRouteProps: createRoutePropsHere,
            createRouteResult,
          })
        },
        method,
        path,
        model,
      }
    }
  }
}
