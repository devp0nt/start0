import fs from "node:fs/promises"
import type { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientCtx"
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import { Project } from "ts-morph"

// TODO: remove it, use getConstExportNames right inside importFromFiles.gen0.ts

export const getConstExportNames = async (ctx: Gen0ClientProcessCtx, filePath: string) => {
  filePath = ctx.fs.toAbs(filePath)
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
}

export const getRealExportNames = (ctx: Gen0ClientProcessCtx, filePath: string) => {
  filePath = ctx.fs.toAbs(filePath)
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
  name: "getExportNames",
  fns: {
    getConstExportNames,
    getRealExportNames,
  },
} satisfies Gen0Plugin.Definition
