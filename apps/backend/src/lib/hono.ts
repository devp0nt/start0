import { OpenAPIHono } from "@hono/zod-openapi";
import { CtxBackend } from "@shmoject/backend/lib/ctx";
import { Context as HonoContext } from "hono";

export namespace HonoBackend {
  export type ContextVariables = CtxBackend.CtxForRequest;
  export type Context = HonoContext<{
    Variables: ContextVariables;
  }>;

  export const createApp = ({ ctxBackend }: { ctxBackend: CtxBackend.Ctx }) => {
    const honoApp = new OpenAPIHono<{
      Variables: ContextVariables;
    }>();

    honoApp.use(async (c, next) => {
      const ctxForRequestBackend = await CtxBackend.createForRequest({
        ctxBackend,
      });
      for (const [key, value] of Object.entries(ctxForRequestBackend)) {
        c.set(key as keyof ContextVariables, value as never);
      }
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
