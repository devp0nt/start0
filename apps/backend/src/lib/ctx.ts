import { Logger0 } from "@shmoject/modules/lib/logger0"

export namespace BackendCtx {
  export const create = async ({ service }: { service: "api" | "worker" }) => {
    return {
      prisma: { x: 1 },
      logger: Logger0.create({
        debugConfig: process.env.DEBUG,
        category: `backend:${service}`,
        formatter: process.env.NODE_ENV === "production" ? "json" : "pretty",
      }),
    }
  }

  export type Ctx = Awaited<ReturnType<typeof create>>

  export const destroy = async ({ ctx }: { ctx: Ctx }) => {
    ctx.logger.info("Context destroyed")
  }
}
