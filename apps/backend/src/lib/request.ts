import { CtxBackend } from "@shmoject/backend/lib/ctx";

export namespace CtxForBackendRequest {
  export const create = async ({
    ctxBackend,
  }: {
    ctxBackend: CtxBackend.Ctx;
  }) => {
    return {
      ctxBackend,
      ...ctxBackend,
      logger: {
        y: 1,
      },
    };
  };

  export type Ctx = Awaited<ReturnType<typeof create>>;
}
