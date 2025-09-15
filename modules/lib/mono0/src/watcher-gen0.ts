import type { Gen0Plugin } from '@devp0nt/gen0/plugin'
import { Mono0 } from './index'

export default (async ({}) => {
  const mono0 = await Mono0.create()

  const handler = async () => {
    try {
      await mono0.sync()
      mono0.logger.info(`🟢 mono0 sync completed`)
    } catch (error) {
      mono0.logger.error(`🔴 mono0 sync failed`, error)
    }
  }

  return {
    name: 'mono0',
    init: handler,
    watchers: {
      main: {
        watch: ['~/**/mono0.json{,c}', '~/**/src', '~/.mono0rc.json{,c}', '~/.mono0/config.json{,c}'],
        handler: async () => {
          await mono0.refresh()
          await handler()
        },
      },
    },
    vars: {
      mono0,
    },
  }
}) satisfies Gen0Plugin.Definition
