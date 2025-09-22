import { createEnv } from '@backend/core/lib/env'
import type { T0 } from '@backend/core/lib/tri0'
import { Ctx0 } from '@devp0nt/ctx0'
import { Prisma0 } from '@prisma0/backend'

export namespace BackendCtx {
  export const create = ({ service, tri0 }: { service: string; tri0: T0.Self }) => {
    return Ctx0.create(() => {
      // biome-ignore lint/style/noProcessEnv: <it is ok here>
      const env = createEnv(process.env)
      const prisma = Prisma0.createClient({
        logger: tri0.logger,
        isTestNodeEnv: env.isTestNodeEnv,
        isLocalHostEnv: env.isLocalHostEnv,
      })
      return {
        tri0,
        prisma,
        env,
      }
    })
  }

  export type Self = ReturnType<typeof create>
  export type Value = Omit<Self, 'self'>
}
