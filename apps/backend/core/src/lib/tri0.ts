import { Error0 } from '@devp0nt/error0'
import { Logger0 } from '@devp0nt/logger0'
import { logger0AdapterProject } from '@devp0nt/logger0/adapters/logger0-adapter-project'
import { Meta0 } from '@devp0nt/meta0'
import { Tri0 } from '@devp0nt/tri0'

export namespace T0 {
  export const create = () => {
    Logger0.init({
      // biome-ignore lint/style/noProcessEnv: <ok here>
      filterByTags: process.env.DEBUG,
      reset: true,
      rootTagPrefix: 'ideanick',
    })
    const logger = Logger0.create({
      adapter: logger0AdapterProject,
    })
    const meta = Meta0.create()
    const tri0 = Tri0.create({
      Error0,
      logger,
      meta,
    })
    return tri0
  }

  export type Self = ReturnType<typeof create>
  export type Items = Pick<Self, 'meta' | 'logger' | 'Error0'>
}
