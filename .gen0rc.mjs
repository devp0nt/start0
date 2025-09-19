import { pluginsImportJs } from '@devp0nt/gen0'

export default {
  // afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
  debug: true,
  plugins: [pluginsImportJs],
  clientsGlob: ['./{apps/modules/tools}/**/*.{ts,tsx,js,jsx,mjs,json,jsonc}', 'justfile'],
}
