import { Gen0 } from "@ideanick/tools/gen0"
import { Project } from "ts-morph"

export default Gen0.definePlugin({
  ctx: {
    getExportNames: async (ctx, filePath: string) => {
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
})
