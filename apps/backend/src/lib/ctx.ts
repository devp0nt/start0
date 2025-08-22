import { Logger0 } from "@shmoject/modules/lib/logger0"

export namespace BackendCtx {
  export const create = async () => {
    return {
      prisma: { x: 1 },
      logger: Logger0.create({
        category: "backend",
        formatter: process.env.NODE_ENV === "production" ? "json" : "pretty",
      }),
    }
  }

  export type Ctx = Awaited<ReturnType<typeof create>>

  export const destroy = async ({ backendCtx }: { backendCtx: Ctx }) => {
    console.info("Context destroyed", Object.keys(backendCtx))
  }
}
