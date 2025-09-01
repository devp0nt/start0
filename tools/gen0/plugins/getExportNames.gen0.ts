import fs from "node:fs/promises"
import type { Gen0 } from "@ideanick/tools/gen0"
import { Project } from "ts-morph"

export default {
  ctx: {
    getConstExportNames: async (ctx, filePath: string) => {
      filePath = ctx.fromRelative(filePath)
      const content = await fs.readFile(filePath, "utf8")

      // Match: export const <identifier>
      const regex = /export\s+const\s+([A-Za-z0-9_$]+)/g
      const matches: string[] = []
      let match: RegExpExecArray | null
      // biome-ignore lint/suspicious/noAssignInExpressions: <x>
      while ((match = regex.exec(content)) !== null) {
        matches.push(match[1])
      }

      return matches
    },
    getRealExportNames: (ctx, filePath: string) => {
      filePath = ctx.fromRelative(filePath)
      const project = new Project({
        // tsConfigFilePath: "tsconfig.json", // make sure this exists in your project
      })

      // Add and get the source file
      const sourceFile = project.addSourceFileAtPath(filePath)

      const exportNames: string[] = []

      // --- 1. Directly exported declarations (functions, classes, consts, etc.)
      sourceFile.getExportedDeclarations().forEach((decls, name) => {
        exportNames.push(name)
      })

      // --- 2. Re-exports like: `export { a, b } from "./other"`
      sourceFile.getExportDeclarations().forEach((expDecl) => {
        expDecl.getNamedExports().forEach((namedExport) => {
          exportNames.push(namedExport.getName())
        })
      })

      return exportNames
    },
  },
} satisfies Gen0.Plugin
