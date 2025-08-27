import { BackendCtx } from "@shmoject/backend/lib/ctx"
import type { e0s as e0sDefault } from "@shmoject/modules/lib/error0"
import type { Logger0 } from "@shmoject/modules/lib/logger0"
import type { Meta0 } from "@shmoject/modules/lib/meta0"
import type { Prisma0 } from "@shmoject/modules/prisma/prisma0.be"
import type { Context as HonoContext } from "hono"
import { getConnInfo } from "hono/bun"

export class HonoReqCtx {
  req: HonoContext["req"]
  meta: Meta0
  logger: Logger0
  e0s: typeof e0sDefault
  prisma: Prisma0.Client
  honoReqCtx: HonoReqCtx
  backendCtx: BackendCtx

  private constructor({
    backendCtx,
    honoCtx,
  }: {
    backendCtx: BackendCtx
    honoCtx: HonoContext
  }) {
    const req = honoCtx.req
    const connInfo = getConnInfo(honoCtx)
    const meta = backendCtx.meta.extend({
      ip: connInfo.remote.address,
      userAgent: req.header("User-Agent"),
      reqMethod: req.method,
      reqPath: req.path,
    })
    const extendable = backendCtx.extend(meta)
    this.req = req
    this.meta = extendable.meta
    this.logger = extendable.logger
    this.e0s = extendable.e0s
    this.prisma = backendCtx.prisma
    this.honoReqCtx = this
    this.backendCtx = backendCtx
  }

  static async create({
    backendCtx,
    honoCtx,
  }: {
    backendCtx: BackendCtx
    honoCtx: HonoContext
  }) {
    return new HonoReqCtx({ backendCtx, honoCtx })
  }

  extend(meta: Meta0.Meta0OrValueTypeNullish) {
    return BackendCtx.extend(this, meta)
  }

  destroy() {
    this.logger.info("Context destroyed")
  }
}

export namespace HonoReqCtx {
  export type Extendable = Pick<HonoReqCtx, "meta" | "logger" | "e0s">
  export type Flat = Pick<HonoReqCtx, keyof HonoReqCtx>
}
