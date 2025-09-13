import { createEnv, type Env } from "@backend/core/lib/env"
import { Error0, e0s as e0sDefault } from "@devp0nt/error0"
import type { FnPropsKeys, NonFnProps } from "@devp0nt/lodash0"
import { Logger0 } from "@devp0nt/logger0"
import { Meta0 } from "@devp0nt/meta0"
import { Prisma0 } from "@prisma0/backend"

// TODO: private constructor

export class BackendCtx {
  meta: Meta0
  logger: Logger0
  e0s: typeof e0sDefault
  prisma: Prisma0.Client
  env: Env

  constructor(backendCtx: BackendCtx)
  constructor({ meta }: { meta: Meta0.Meta0OrValueTypeNullish })
  constructor(props: any) {
    if (props instanceof BackendCtx) {
      // for extending purposes we just make copy of backendCtx
      const backendCtx = props
      this.meta = backendCtx.meta
      this.logger = backendCtx.logger
      this.e0s = backendCtx.e0s
      this.prisma = backendCtx.prisma
      this.env = backendCtx.env
      return
    }
    const { meta: providedMeta } = props as {
      meta: Meta0.Meta0OrValueTypeNullish
    }

    const meta = Meta0.from(providedMeta)
    meta.assign({
      tagPrefix: meta.getValue().tagPrefix || "backend",
    })
    // biome-ignore lint/style/noProcessEnv: <x>
    const env = createEnv(process.env)
    const e0s = Error0.extendCollection(e0sDefault, {
      defaultMeta: meta,
    })
    const logger = Logger0.create({
      debugConfig: env.DEBUG,
      meta,
      formatter: env.isProductionNodeEnv ? "json" : "pretty",
    })
    this.env = env
    this.meta = meta
    this.logger = logger
    this.e0s = e0s
    this.prisma = Prisma0.createClient({ ctx: this })
  }

  static async create({ meta }: { meta: Meta0.Meta0OrValueTypeNullish }) {
    return new BackendCtx({ meta })
  }

  extend(meta: Meta0.Meta0OrValueTypeNullish): BackendCtx
  extend(tagPrefix: string): BackendCtx
  extend(metaOrTagPrefix: any): BackendCtx {
    const backendCtx = new BackendCtx(this)
    const extendable = BackendCtx.extendExtendable(this, metaOrTagPrefix)
    backendCtx.meta = extendable.meta
    backendCtx.logger = extendable.logger
    backendCtx.e0s = extendable.e0s
    return backendCtx
  }

  static extendExtendable(extendable: BackendCtx.Extendable, meta: Meta0.Meta0OrValueTypeNullish): BackendCtx.Extendable
  static extendExtendable(extendable: BackendCtx.Extendable, tagPrefix: string): BackendCtx.Extendable
  static extendExtendable(extendable: BackendCtx.Extendable, metaOrTagPrefix: any): BackendCtx.Extendable {
    const meta =
      typeof metaOrTagPrefix === "string"
        ? { tagPrefix: metaOrTagPrefix }
        : (metaOrTagPrefix as Meta0.Meta0OrValueTypeNullish)
    const extendedMeta = extendable.meta.extend(meta)
    const e0s = Error0.extendCollection(extendable.e0s, {
      defaultMeta: extendedMeta,
    })
    const logger = extendable.logger.extend({
      replaceMeta: extendedMeta,
    })
    return {
      meta: extendedMeta,
      logger,
      e0s,
    }
  }

  async destroy() {
    await this.prisma.$disconnect()
    this.logger.info("BackendCtx destroyed")
  }
}

export namespace BackendCtx {
  export type Props = NonFnProps<BackendCtx>
  export type ExtendableKeys = "meta" | "logger" | "e0s"
  export type Extendable = Pick<BackendCtx, ExtendableKeys>
  export type Unextendable = Omit<BackendCtx, ExtendableKeys | FnPropsKeys<BackendCtx>>
}
