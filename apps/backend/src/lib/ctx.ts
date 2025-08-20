export namespace CtxBackend {
  export const create = async () => {
    return {
      prisma: { x: 1 },
      logger: { y: 2 },
    };
  };

  export type Ctx = Awaited<ReturnType<typeof create>>;

  export const destroy = async ({ ctxBackend }: { ctxBackend: Ctx }) => {
    console.log("Context destroyed", Object.keys(ctxBackend));
  };

  export const createForRequest = async ({
    ctxBackend,
  }: {
    ctxBackend: Ctx;
  }) => {
    return {
      ctxBackend,
      ...ctxBackend,
      logger: {
        y: 1,
      },
    };
  };

  export type CtxForRequest = Awaited<ReturnType<typeof createForRequest>>;
}
