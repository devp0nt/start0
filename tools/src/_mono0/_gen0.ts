// import type { Gen0Plugin } from "@/tools/gen0/plugin"
// // import { Mono0 } from "@/tools/mono0"

// export default (async () => {
//   return {
//     name: "package",
//     init: async () => {
//       const { Mono0 } = await import(`@/tools/mono0?t=${Date.now()}`)
//       await Mono0.write()
//     },
//     watchers: {
//       createTsConfigAndPackageJson: {
//         watch: ["/Users/iserdmi/cc/projects/svagatron/tools/src/mono0/*"],
//         handler: async (ctx, event, path) => {
//           const { Mono0 } = await import(`@/tools/mono0?t=${Date.now()}`)
//           await Mono0.write()
//         },
//       },
//     },
//   }
// }) satisfies Gen0Plugin.Definition
