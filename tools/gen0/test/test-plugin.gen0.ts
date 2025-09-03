import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

export default {
  name: "testPlugin",
  watchers: {
    testWatcher: {
      watch: ["**/*.test.txt", "!**/bad.test.txt"],
      clientsGlob: "./test-client.ts",
      handler: (ctx, event, path) => {
        // console.log("1000zxczxczxcxzxc", event, path, "xxxxx")
      },
    },
  },
} satisfies Gen0Plugin.DefinitionResult
