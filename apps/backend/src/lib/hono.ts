import {
  createRoute,
  OpenAPIHono,
  type RouteConfig,
  type z,
} from "@hono/zod-openapi"
import type { BackendCtx } from "@shmoject/backend/lib/ctx"
import { HonoRouteModel } from "@shmoject/backend/lib/hono.model"
import { Error0 } from "@shmoject/modules/lib/error0"
import { Meta0 } from "@shmoject/modules/lib/meta0"
import type { Context as HonoContext } from "hono"
import { getConnInfo } from "hono/bun"

export namespace HonoApp {
  export type HonoCtx = HonoContext<{
    Variables: ReqCtx
  }>

  export const create = ({ backendCtx }: { backendCtx: BackendCtx.Ctx }) => {
    const honoApp = new OpenAPIHono<{
      Variables: ReqCtx
    }>()

    honoApp.use(async (c, next) => {
      const backendCtxForRequest = await HonoApp.createReqCtx({
        backendCtx,
        honoCtx: c,
      })
      for (const [key, value] of Object.entries(backendCtxForRequest)) {
        c.set(key as keyof ReqCtx, value as never)
      }
      await next()
    })

    return { honoApp }
  }

  export const createReqCtx = async ({
    backendCtx,
    honoCtx,
  }: {
    backendCtx: BackendCtx.Ctx
    honoCtx: HonoContext
  }) => {
    const logger = backendCtx.logger.getChild("req")
    const meta = Meta0.create()
    logger.replaceMeta(meta)

    const req = honoCtx.req
    const connInfo = getConnInfo(honoCtx)
    meta.assign({
      ip: connInfo.remote.address,
      userAgent: req.header("User-Agent"),
      reqMethod: req.method,
      reqPath: req.path,
    })

    return {
      backendCtx,
      ...backendCtx,
      logger,
      meta,
    }
  }

  export type ReqCtx = Awaited<ReturnType<typeof createReqCtx>>

  export const applyLogging = ({ honoApp }: { honoApp: AppType }) => {
    honoApp.use(async (c, next) => {
      const logger = c.var.logger
      const reqStartedAt = performance.now()
      logger.info({
        message: "Hono request started",
      })
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
