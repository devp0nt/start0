import { Error0, e0s as e0sDefault } from "@shmoject/modules/lib/error0.sh"
import { Logger0 } from "@shmoject/modules/lib/logger0.sh"
import { Meta0 } from "@shmoject/modules/lib/meta0.sh"
import { Prisma0 } from "@shmoject/modules/prisma/prisma0.be"

// TODO: make better, what extendable...
export class BackendCtx {
  meta: Meta0
  logger: Logger0
  e0s: typeof e0sDefault
  prisma: Prisma0.Client

  private constructor({ meta }: { meta: Meta0.Meta0OrValueTypeNullish }) {
    meta = Meta0.from(meta)
    meta.assign({
      tagPrefix: "backend",
    })
    const e0s = Error0.extendCollection(e0sDefault, {
      defaultMeta: meta,
    })
    const logger = Logger0.create({
      debugConfig: process.env.DEBUG,
      meta,
      formatter: process.env.NODE_ENV === "production" ? "json" : "pretty",
    })
    const extendable = {
      meta,
      logger,
      e0s,
    }
    this.meta = meta
    this.logger = logger
    this.e0s = e0s
    this.prisma = Prisma0.createClient({ ctx: extendable })
  }

  static async create({ meta }: { meta: Meta0.Meta0OrValueTypeNullish }) {
    return new BackendCtx({ meta })
  }

  static extend(
    extendable: BackendCtx.Extendable,
    meta: Meta0.Meta0OrValueTypeNullish,
  ) {
    meta = extendable.meta.extend(meta)
    const e0s = Error0.extendCollection(extendable.e0s, {
      defaultMeta: meta,
    })
    const logger = extendable.logger.extend({
      replaceMeta: meta,
    })
    return {
      meta,
      logger,
      e0s,
    }
  }

  extend(meta: Meta0.Meta0OrValueTypeNullish) {
    return BackendCtx.extend(this, meta)
  }

  destroy() {
    this.logger.info("Context destroyed")
  }
}

export namespace BackendCtx {
  export type Extendable = Pick<BackendCtx, "meta" | "logger" | "e0s">
  export type AllProps = Pick<BackendCtx, keyof BackendCtx>
}
