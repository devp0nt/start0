import {
  createRoute,
  OpenAPIHono,
  z,
  type RouteConfig,
} from "@hono/zod-openapi";
import { BackendCtx } from "@shmoject/backend/lib/ctx";
import { ReqCtx } from "@shmoject/backend/lib/req";
import type { Context as HonoContext } from "hono";

export namespace HonoApp {
  export type ContextVariables = ReqCtx.CtxType;
  export type Context = HonoContext<{
    Variables: ContextVariables;
  }>;

  export const create = ({
    backendCtx,
  }: {
    backendCtx: BackendCtx.CtxType;
  }) => {
    const honoApp = new OpenAPIHono<{
      Variables: ContextVariables;
    }>();

    honoApp.use(async (c, next) => {
      const backendCtxForRequest = await ReqCtx.create({
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

  export const withApp = <T extends (props: { honoApp: AppType }) => any>(
    fn: T
  ) => {
    return fn;
  };

  export type ResponseContentType =
    | "application/json"
    | "text/html"
    | "text/plain"
    | "application/xml";

  export type RouteModel<
    TZQuery extends z.ZodObject | z.ZodAny | undefined = undefined,
    TZResponse extends z.ZodObject | z.ZodAny | undefined = undefined,
    TResponseContentType extends ResponseContentType | undefined = undefined,
  > = {
    query: TZQuery extends z.ZodObject ? TZQuery : undefined;
    response: TZResponse extends z.ZodObject ? TZResponse : z.ZodAny;
    responseContentType: TResponseContentType extends ResponseContentType
      ? TResponseContentType
      : "application/json";
  };

  export const defineRouteModel = <
    TZQuery extends z.ZodObject | z.ZodAny | undefined = undefined,
    TZResponse extends z.ZodObject | z.ZodAny | undefined = undefined,
    TResponseContentType extends ResponseContentType | undefined = undefined,
  >(props: {
    query?: TZQuery;
    response?: TZResponse;
    responseContentType?: TResponseContentType;
  }) => {
    return {
      query: props.query,
      response: props.response || z.any(),
      responseContentType: props.responseContentType || "application/json",
    } as RouteModel<TZQuery, TZResponse, TResponseContentType>;
  };

  export const defineRoute = <
    TMethod extends RouteConfig["method"],
    TPath extends RouteConfig["path"],
    TZQuery extends z.ZodObject | z.ZodAny | undefined = undefined,
    TZResponse extends z.ZodObject | z.ZodAny | undefined = undefined,
    TResponseContentType extends ResponseContentType | undefined = undefined,
  >(props0: {
    method: TMethod;
    path: TPath;
    model?: {
      query?: TZQuery;
      response?: TZResponse;
      responseContentType?: TResponseContentType;
    };
  }) => {
    const model = defineRouteModel(props0.model || {});
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
      }) => any
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
