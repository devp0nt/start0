export namespace BackendCtx {
  export const create = async () => {
    return {
      prisma: { x: 1 },
      logger: { y: 2 },
    }
  }

  export type Ctx = Awaited<ReturnType<typeof create>>

  export const destroy = async ({ backendCtx }: { backendCtx: Ctx }) => {
    console.info("Context destroyed", Object.keys(backendCtx))
  }
}
