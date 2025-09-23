/** biome-ignore-all lint/style/noProcessEnv: <ok here> */
import { createEnv } from '@backend/core/lib/env'
import { Ctx0 } from '@devp0nt/ctx0'
import { Error0 } from '@devp0nt/error0'
import { Logger0 } from '@devp0nt/logger0'
import { logger0AdapterProject } from '@devp0nt/logger0/adapters/logger0-adapter-project'
import { Meta0 } from '@devp0nt/meta0'
import { Tri0 as OriginalTri0 } from '@devp0nt/tri0'
import { Prisma0 } from '@prisma0/backend'

export namespace Tri0 {
  export const create = () => {
    Logger0.init({
      filterByTags: process.env.DEBUG,
      reset: true,
      rootTagPrefix: 'ideanick',
      consoleFormatter: process.env.NODE_ENV === 'development' ? 'prettyYaml' : 'json',
    })
    const logger = Logger0.create({
      adapter: logger0AdapterProject,
    })
    const meta = Meta0.create({
      tagPrefix: 'backend',
    })
    const tri0 = OriginalTri0.create({
      Error0,
      logger,
      meta,
    })
    return tri0
  }

  export type Self = ReturnType<typeof create>
  export type Items = Pick<Self, 'meta' | 'logger' | 'Error0'>
}

export namespace BackendCtx {
  export const create = ({ service, tri0 }: { service: string; tri0: Tri0.Self }) => {
    return Ctx0.create('backend', () => {
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
