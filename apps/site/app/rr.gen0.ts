/** biome-ignore-all lint/suspicious/noConsole: <x> */
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

export default (({ fs }) => {
  console.error("azfassaf")
  return {
    name: "reactRouter",
    watchers: {
      createRouteByPage: {
        watch: ["~/**/*.page.si.ts{x,}"],
        handler: (event, path) => {
          console.error(event, path, "x")
        },
      },
    },
  }
}) satisfies Gen0Plugin.Definition
