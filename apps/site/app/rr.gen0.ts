import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

export default {
  name: "reactRouter",
  watchers: {
    createRouteByPage: {
      watch: ["~/**/*.page.si.ts"],
      handler: (event, path) => {
        console.log(event, path, "x")
      },
    },
  },
} satisfies Gen0Plugin.Definition
