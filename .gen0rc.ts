import type { Gen0 } from "@ideanick/tools/gen0/index.ts"

// /gen0 store.x = await importFromTsFiles({ globPattern: gen0.pluginsGlob, defaultExport: (props) => props.fileBasename.replace(/\.gen0/, "") })

import getExportNames from "./tools/gen0/plugins/getExportNames.gen0.ts"
import importFromTsFiles from "./tools/gen0/plugins/importFromTsFiles.gen0.ts"
// gen0/

export default {
  afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
  plugins: {
    // /gen0 store.x.exportNames.map(name => print(`${name},`))

    getExportNames,
    importFromTsFiles,
    // gen0/
  },
} satisfies Gen0.Config
