import mono0Watcher from "./modules/lib/mono0/src/watcher-gen0"

export default {
  // afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
  debug: true,
  plugins: [mono0Watcher],
}
