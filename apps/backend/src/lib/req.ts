import type { BackendCtx } from "@shmoject/backend/lib/ctx"

export namespace BackendReqCtx {
  export const create = async ({
    backendCtx,
  }: {
    backendCtx: BackendCtx.Ctx
  }) => {
    return {
      backendCtx,
      ...backendCtx,
      logger: {
        y: 1,
      },
    }
  }

  export type Ctx = Awaited<ReturnType<typeof create>>
}
