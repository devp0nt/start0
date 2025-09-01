import nodePath from "node:path"
import type { Gen0 } from "@ideanick/tools/gen0"

export default {
  ctx: {
    importFromTsFiles: async (
      ctx,
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
      const paths = await ctx.glob(globPattern)
      const result: { files: Array<{ path: string; exportNames: string[] }>; exportNames: string[] } = {
        files: [],
        exportNames: [],
      }
      for (let path of paths) {
        if (!defaultExport) {
          let exportNames = await ctx.getConstExportNames(path)
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
    },
  },
} satisfies Gen0.Plugin
