import type { Gen0Config } from "@ideanick/tools/gen0/config"

export default {
  afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
  clients: [
    "tools/gen0/test-file.ts",
    "tools/gen0/target.ts",
    "apps/backend/src/router/index.hono.ts",
    "apps/backend/src/router/index.trpc.ts",
  ],
} satisfies Gen0Config.Definition
