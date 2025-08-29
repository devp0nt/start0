import { BackendCtx } from "@shmoject/backend/lib/ctx"
import type { Env } from "@shmoject/backend/lib/env"
import type { e0s as e0sDefault } from "@shmoject/modules/lib/error0.sh"
import type { FnPropsKeys, NonFnProps } from "@shmoject/modules/lib/lodash0.sh"
import type { Logger0 } from "@shmoject/modules/lib/logger0.sh"
import type { Meta0 } from "@shmoject/modules/lib/meta0.sh"
import type { Prisma0 } from "@shmoject/modules/prisma/prisma.be"
import type { Context as HonoContext } from "hono"

export class HonoReqCtx {
  // extended from BackendCtx
  meta: Meta0
  logger: Logger0
  e0s: typeof e0sDefault
  prisma: Prisma0.Client
  env: Env

  // own props
  req: HonoContext["req"]
  honoCtx: HonoContext
  backendCtx: BackendCtx

  constructor(honoReqCtx: HonoReqCtx)
  constructor(props: {
    backendCtx: BackendCtx
    honoCtx: HonoContext
    meta?: Meta0.Meta0OrValueTypeNullish
  })
  constructor(props: any) {
    // for extending purposes we just make copy of honoReqCtx
    if (props instanceof HonoReqCtx) {
      const honoReqCtx = props
      this.backendCtx = honoReqCtx.backendCtx
      this.honoCtx = honoReqCtx.honoCtx
      this.meta = honoReqCtx.meta
      this.logger = honoReqCtx.logger
      this.e0s = honoReqCtx.e0s
      this.prisma = honoReqCtx.prisma
      this.env = honoReqCtx.env
      this.req = honoReqCtx.req
      return
    }
    const {
      backendCtx,
      honoCtx,
      meta: providedMeta,
    } = props as {
      backendCtx: BackendCtx
      honoCtx: HonoContext
      meta?: Meta0.Meta0OrValueTypeNullish
    }

    this.prisma = backendCtx.prisma
    this.env = backendCtx.env

    const extendable = BackendCtx.extendExtendable(backendCtx, providedMeta)
    this.meta = extendable.meta
    this.logger = extendable.logger
    this.e0s = extendable.e0s

    this.req = honoCtx.req
    this.honoCtx = honoCtx
    this.backendCtx = backendCtx
  }

  static async create({
    backendCtx,
    honoCtx,
    meta,
  }: {
    backendCtx: BackendCtx
    honoCtx: HonoContext
    meta?: Meta0.Meta0OrValueTypeNullish
  }) {
    return new HonoReqCtx({ backendCtx, honoCtx, meta })
  }

  extend(meta: Meta0.Meta0OrValueTypeNullish): HonoReqCtx
  extend(tagPrefix: string): HonoReqCtx
  extend(metaOrTagPrefix: any): HonoReqCtx {
    const honoReqCtx = new HonoReqCtx(this)
    const extendable = BackendCtx.extendExtendable(this, metaOrTagPrefix)
    honoReqCtx.meta = extendable.meta
    honoReqCtx.logger = extendable.logger
    honoReqCtx.e0s = extendable.e0s
    return honoReqCtx
  }

  getUnextendable(): HonoReqCtx.Unextendable {
    return {
      backendCtx: this.backendCtx,
      honoCtx: this.honoCtx,
      prisma: this.prisma,
      env: this.env,
      req: this.req,
    }
  }

  async destroy() {
    this.logger.info("HonoReqCtx destroyed")
  }
}

export namespace HonoReqCtx {
  export type Props = NonFnProps<HonoReqCtx>
  export type ExtendableKeys = "meta" | "logger" | "e0s"
  export type Extendable = Pick<HonoReqCtx, ExtendableKeys>
  export type Unextendable = Omit<
    HonoReqCtx,
    ExtendableKeys | FnPropsKeys<HonoReqCtx>
  >
}
