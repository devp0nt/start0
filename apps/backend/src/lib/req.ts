import { BackendCtx } from "@shmoject/backend/lib/ctx";

export namespace ReqCtx {
  export const create = async ({
    backendCtx,
  }: {
    backendCtx: BackendCtx.CtxType;
  }) => {
    return {
      backendCtx,
      ...backendCtx,
      logger: {
        y: 1,
      },
    };
  };

  export type CtxType = Awaited<ReturnType<typeof create>>;
}
