import mono0Watcher from './modules/lib/mono0/src/watcher-gen0'
import tmux0 from './modules/lib/tmux0/src/gen0'

export default {
  // afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
  debug: true,
  plugins: [mono0Watcher, tmux0],
}
