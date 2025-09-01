import { Gen0 } from "@ideanick/tools/gen0/utils"

// Gen0.addToCtx("importTrpcRoutes", async (ctx) => {
//   const paths = await ctx.glob("./**/route.trpc.ts")
//   console.log("paths", paths)
//   for (const path of paths) {
//     ctx.print(`import x from "${path}"`)
//   }
// })

export default {
  ctx: {
    importTrpcRoutes: async (ctx) => {
      const paths = await ctx.glob("./**/route.trpc.ts")
      console.log("paths", paths)
      for (const path of paths) {
        ctx.print(`import x from "${path}"`)
      }
    },
  },
} satisfies Gen0.Plugin
