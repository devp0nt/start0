import {
  createRoute,
  OpenAPIHono,
  type RouteConfig,
  type z,
} from "@hono/zod-openapi";
import type { BackendCtx } from "@shmoject/backend/lib/ctx";
import { HonoRouteModel } from "@shmoject/backend/lib/hono.model";
import { BackendReqCtx } from "@shmoject/backend/lib/req";
import type { Context as HonoContext } from "hono";

export namespace HonoApp {
  export type ContextVariables = BackendReqCtx.Ctx;
  export type Context = HonoContext<{
    Variables: ContextVariables;
  }>;

  export const create = ({ backendCtx }: { backendCtx: BackendCtx.Ctx }) => {
    const honoApp = new OpenAPIHono<{
      Variables: ContextVariables;
    }>();

    honoApp.use(async (c, next) => {
      const backendCtxForRequest = await BackendReqCtx.create({
        backendCtx,
      });
      for (const [key, value] of Object.entries(backendCtxForRequest)) {
        c.set(key as keyof ContextVariables, value as never);
      }
      await next();
    });

    return { honoApp };
  };

  export type AppType = ReturnType<typeof create>["honoApp"];

  export const defineRoute = <
    TMethod extends RouteConfig["method"],
    TPath extends RouteConfig["path"],
    TZQuery extends z.ZodObject | z.ZodAny | undefined = undefined,
    TZResponse extends z.ZodObject | z.ZodAny | undefined = undefined,
    TResponseContentType extends
      | HonoRouteModel.ResponseContentType
      | undefined = undefined,
  >(props0: {
    method: TMethod;
    path: TPath;
    model?: {
      query?: TZQuery;
      response?: TZResponse;
      responseContentType?: TResponseContentType;
    };
  }) => {
    const model = HonoRouteModel.defineModel(props0.model || {});
    const { method, path } = props0;

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
    };

    const createRouteResult = createRoute(createRoutePropsHere);

    return (
      fn1: (props1: {
        honoApp: AppType;
        createRouteProps: typeof createRoutePropsHere;
        createRouteResult: typeof createRouteResult;
      }) => void,
    ) => {
      return {
        apply: (props: { honoApp: AppType }) => {
          return fn1({
            honoApp: props.honoApp,
            createRouteProps: createRoutePropsHere,
            createRouteResult,
          });
        },
        method,
        path,
        model,
      };
    };
  };
}
