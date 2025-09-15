import type { Gen0ClientProcessCtx } from '@devp0nt/gen0/clientProcessCtx'
import type { Gen0Plugin } from '@devp0nt/gen0/plugin'
import { Project } from 'ts-morph'

export const getRealExportNames = (ctx: Gen0ClientProcessCtx, filePath: string) => {
  filePath = ctx.fs0.toAbs(filePath)
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
}

export default {
  name: 'getExportNames',
  fns: {
    getRealExportNames,
  },
} satisfies Gen0Plugin.DefinitionResult
