import nodePath from "node:path"
import type { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientCtx"
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import { getConstExportNames } from "@ideanick/tools/gen0/plugins/getExportNames.gen0"

export const importFromTsFiles = async (
  ctx: Gen0ClientProcessCtx,
  {
    globPattern,
    exportEndsWith,
    defaultExport,
    withJsExt = true,
  }: {
    globPattern: string | string[]
    exportEndsWith?: string
    defaultExport?: (props: {
      filePath: string
      fileName: string
      fileBasename: string
      fileDir: string
      fileExt: string
    }) => string
    withJsExt?: boolean
  },
) => {
  const paths = await ctx.fs.findFilesPaths(globPattern)
  const result: { files: Array<{ path: string; exportNames: string[] }>; exportNames: string[] } = {
    files: [],
    exportNames: [],
  }
  for (let path of paths) {
    if (!defaultExport) {
      let exportNames = await getConstExportNames(ctx, path)
      if (exportEndsWith) {
        exportNames = exportNames.filter((exportName: string) => exportName.endsWith(exportEndsWith))
      }
      if (exportNames.length === 0) {
        continue
      }
      if (withJsExt) {
        path = path.replace(/\.tsx?$/, ".js")
      }
      result.files.push({ path, exportNames })
      result.exportNames.push(...exportNames)
      ctx.print(`import { ${exportNames.join(", ")} } from "${path}"`)
    } else {
      const fileName = nodePath.basename(path)
      const fileExt = nodePath.extname(path)
      const fileBasename = nodePath.basename(path, fileExt)
      const fileDir = nodePath.dirname(path)
      const defaultExportName = defaultExport({
        filePath: path,
        fileName,
        fileBasename,
        fileDir,
        fileExt,
      })
      const exportNames = [defaultExportName]
      result.files.push({ path, exportNames })
      result.exportNames.push(defaultExportName)
      ctx.print(`import ${defaultExportName} from "${path}"`)
    }
  }
  return result
}

export default {
  name: "importFromTsFiles",
  fns: {
    importFromTsFiles,
  },
} satisfies Gen0Plugin.Definition
