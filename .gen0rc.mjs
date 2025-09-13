import mono0Watcher from "@/tools/mono0/watcher-gen0"

export default {
  // afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
  debug: true,
  plugins: [mono0Watcher],
}
