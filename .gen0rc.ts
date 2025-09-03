import type { Gen0Config } from "@ideanick/tools/gen0/config"

export default {
  afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
} satisfies Gen0Config.Definition
