export namespace BackendCtx {
  export const create = async () => {
    return {
      prisma: { x: 1 },
      logger: { y: 2 },
    };
  };

  export type CtxType = Awaited<ReturnType<typeof create>>;

  export const destroy = async ({ backendCtx }: { backendCtx: CtxType }) => {
    console.log("Context destroyed", Object.keys(backendCtx));
  };
}
