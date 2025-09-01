import { Gen0 } from "@ideanick/tools/gen0/index.js"

export default Gen0.definePlugin({
  ctx: {
    importFromTsFiles: async (
      ctx,
      {
        globPattern,
        exportEndsWith,
        withJsExt = true,
      }: { globPattern: string | string[]; exportEndsWith?: string; withJsExt?: boolean },
    ) => {
      const paths = await ctx.glob(globPattern)
      const result: { files: Array<{ path: string; exportNames: string[] }>; exportNames: string[] } = {
        files: [],
        exportNames: [],
      }
      for (let path of paths) {
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
      }
      return result
    },
  },
})
