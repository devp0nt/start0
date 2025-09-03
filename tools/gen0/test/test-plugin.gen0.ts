import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

export default {
  name: "testPlugin",
  watchers: {
    testWatcher: {
      watch: ["**/*.test.txt", "!**/bad.test.txt"],
      clientsGlob: "./test-client.ts",
      handler: (event, path) => {
        // console.log(event, path, "x");
      },
    },
  },
} satisfies Gen0Plugin.Definition
