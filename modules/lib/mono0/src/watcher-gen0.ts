import type { Gen0Plugin } from "@devp0nt/gen0/plugin"
import { Mono0 } from "@devp0nt/mono0/index"

const handler = async () => {
  const mono0 = await Mono0.create()
  try {
    await mono0.sync()
    mono0.logger.info(`🟢 mono0 sync completed`)
  } catch (error) {
    mono0.logger.error(`🔴 mono0 sync failed`, error)
  }
}

export default (({}) => ({
  name: "mono0",
  init: handler,
  watchers: {
    main: {
      watch: ["~/**/mono0.json", "~/**/src", "~/.mono0rc.json", "~/.mono0/config.json"],
      handler,
    },
  },
})) satisfies Gen0Plugin.Definition
