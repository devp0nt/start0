import { OpenAPIHono } from "@hono/zod-openapi";
import { CtxBackend } from "@shmoject/backend/lib/ctx";
import { Context as HonoContext } from "hono";

export namespace HonoBackend {
  export type ContextVariables = CtxBackend.Type & {
    logger: { y: 1 };
  };

  export type Context = HonoContext<{ Variables: ContextVariables }>;

  export const createApp = ({
    ctxBackend,
  }: {
    ctxBackend: CtxBackend.Type;
  }) => {
    const honoApp = new OpenAPIHono<{
      Variables: ContextVariables;
    }>();

    honoApp.use(async (c, next) => {
      // Apply ctxBackend to hono variables
      for (const [key, value] of Object.entries(ctxBackend)) {
        c.set(key as keyof ContextVariables, value as never);
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
