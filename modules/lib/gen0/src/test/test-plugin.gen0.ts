import type { Gen0Plugin } from "@devp0nt/gen0/plugin"

export default {
  name: "testPlugin",
  watchers: {
    testWatcher: {
      watch: ["**/*.test.txt", "!**/bad.test.txt"],
      clientsGlob: "./test-client.ts",
      handler: (ctx, event, path) => {
        // console.info("1000zxczxczxcxzxc", event, path, "xxxxx")
      },
    },
  },
} satisfies Gen0Plugin.DefinitionResult
