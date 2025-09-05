import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

export default (async ({ fs, _ }) => {
  return {
    name: "package",
    init: async () => {},
    watchers: {
      createRouteByPage: {
        watch: [],
        handler: async (ctx, event, path) => {
          console.log(123)
        },
      },
    },
  }
}) satisfies Gen0Plugin.Definition
