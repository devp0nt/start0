import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

export default {
  name: "testPlugin",
  watchers: {
    testWatcher: {
      watch: ["**/*.test.txt", "*.test.txt", "!.git"],
      clientsGlob: "./test-client.ts",
    },
  },
} satisfies Gen0Plugin.Definition
