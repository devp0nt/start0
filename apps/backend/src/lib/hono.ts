import { createRoute, OpenAPIHono, RouteConfig } from "@hono/zod-openapi";
import { BackendCtx } from "@shmoject/backend/lib/ctx";
import { keys } from "@shmoject/modules/lib/lodash0";
import { Context as HonoContext, Hono } from "hono";
import z from "zod";

export namespace Hono0 {
  export type Variables = BackendCtx.Type & {
    logger: { y: 1 };
  };

  export type Context = HonoContext<{ Variables: Variables }>;

  export const createApp = ({
    backendCtx,
  }: {
    backendCtx: BackendCtx.Type;
  }) => {
    const honoApp = new OpenAPIHono<{
      Variables: Variables;
    }>();

    honoApp.use(async (c, next) => {
      // Apply backendCtx to hono variables
      for (const [key, value] of Object.entries(backendCtx)) {
        c.set(key as keyof Variables, value as never);
      }

      // Apply logger with predifined meta to hono variables
      c.set("logger", { y: 1 });

      await next();
    });

    return { honoApp };
  };

  export type App = ReturnType<typeof createApp>["honoApp"];

  export const withApp = <T extends (props: { honoApp: App }) => any>(
    fn: T
  ) => {
    return fn;
  };
}
