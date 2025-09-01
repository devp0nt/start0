import { Gen0 } from "@ideanick/tools/gen0/index.js"

export default Gen0.definePlugin({
  ctx: {
    importTrpcRoutes: async (ctx) => {
      const paths = await ctx.glob("./**/route.trpc.ts")
      for (const path of paths) {
        const exportNames = await ctx.getExportNames(path)
        ctx.print(`import { ${exportNames.join(", ")} } from "${ctx.tsExtToJsExt(path)}"`)
      }
    },
  },
})
