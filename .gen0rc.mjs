import { getGen0PluginImportJs } from '@devp0nt/gen0/plugins/gen0-plugin-import-js'
import { getGen0PluginMono0 } from '@devp0nt/mono0'

export default {
  // afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
  debug: true,
  plugins: [getGen0PluginImportJs(), getGen0PluginMono0({ watcherEnabled: false })],
  clientsGlob: ['./{apps,modules,packages,tools}/**/*.{ts,tsx,js,jsx,mjs,json,jsonc}', 'justfile'],
}
