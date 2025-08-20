import { OpenAPIHono } from "@hono/zod-openapi";
import { CtxBackend } from "@shmoject/backend/lib/ctx";
import { CtxForBackendRequest } from "@shmoject/backend/lib/request";
import { Context as HonoContext } from "hono";

export namespace HonoBackend {
  export type ContextVariables = CtxForBackendRequest.Ctx;
  export type Context = HonoContext<{
    Variables: ContextVariables;
  }>;

  export const createApp = ({ ctxBackend }: { ctxBackend: CtxBackend.Ctx }) => {
    const honoApp = new OpenAPIHono<{
      Variables: ContextVariables;
    }>();

    honoApp.use(async (c, next) => {
      const ctxForBackendRequest = await CtxForBackendRequest.create({
        ctxBackend,
      });
      for (const [key, value] of Object.entries(ctxForBackendRequest)) {
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
