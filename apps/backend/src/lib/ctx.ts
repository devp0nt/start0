export namespace CtxBackend {
  export const create = async () => {
    return {
      prisma: { x: 1 },
      logger: { y: 2 },
    };
  };

  export type Type = Awaited<ReturnType<typeof create>>;

  export const destroy = async ({ ctxBackend }: { ctxBackend: Type }) => {
    console.log("Context destroyed", Object.keys(ctxBackend));
  };
}
