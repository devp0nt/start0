import { Error0, e0s as e0sDefault } from "@shmoject/modules/lib/error0"
import { Logger0 } from "@shmoject/modules/lib/logger0"
import { Meta0 } from "@shmoject/modules/lib/meta0"

export namespace BackendCtx {
  export const create = async ({ service }: { service: "api" | "worker" }) => {
    const meta = Meta0.create({
      service,
    })
    const e0s = Error0.extendCollection(e0sDefault, {
      defaultMeta: meta,
    })
    const logger = Logger0.create({
      debugConfig: process.env.DEBUG,
      meta,
      formatter: process.env.NODE_ENV === "production" ? "json" : "pretty",
    })
    return {
      meta,
      logger,
      e0s,
      prisma: { x: 1 },
    }
  }

  export type Ctx = Awaited<ReturnType<typeof create>>

  export const destroy = async ({ ctx }: { ctx: Ctx }) => {
    ctx.logger.info("Context destroyed")
  }
}
