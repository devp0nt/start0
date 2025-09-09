// import { Mono0Config } from "@/tools/mono0/config"
// import { Mono0CorePackage } from "@/tools/mono0/corePackage"
// import { Mono0ModulePackage } from "@/tools/mono0/modulePackage"
// import { Mono0RootBaseTsconfig, Mono0RootTsconfig } from "@/tools/mono0/tsconfig"

// // TODO: remove previous tsconfig.json
// // TODO: rename old files

// // TODO: filter by alias and name in files
// // TODO: fix gen0 watcher

// // TODO: package.json
// // TODO: add readfile json with comments, not JSON.parse

// export class Mono0 {
//   static mono0: Mono0

//   config: Mono0Config
//   corePackages: Mono0CorePackage[]
//   modulesPackages: Mono0ModulePackage[]
//   rootTsconfig: Mono0RootTsconfig
//   rootBaseTsconfig: Mono0RootBaseTsconfig

//   private constructor(input: {
//     config: Mono0Config
//     corePackages: Mono0CorePackage[]
//     modulesPackages: Mono0ModulePackage[]
//     rootTsconfig: Mono0RootTsconfig
//     rootBaseTsconfig: Mono0RootBaseTsconfig
//   }) {
//     this.config = input.config
//     this.corePackages = input.corePackages
//     this.modulesPackages = input.modulesPackages
//     this.rootTsconfig = input.rootTsconfig
//     this.rootBaseTsconfig = input.rootBaseTsconfig
//     Mono0.mono0 = this
//   }

//   static async init() {
//     const config = await Mono0Config.get()
//     const rootBaseTsconfig = Mono0RootBaseTsconfig.create({ filePath: config.fs0.resolve("./tsconfig.base.json") })
//     const rootTsconfig = Mono0RootTsconfig.create({ filePath: config.fs0.resolve("./tsconfig.json"), rootBaseTsconfig })

//     const corePackages: Mono0CorePackage[] = []
//     for (const corePackageDefinition of config.corePackagesDefinitions) {
//       const corePackage = Mono0CorePackage.create({ config, definition: corePackageDefinition, rootBaseTsconfig })
//       corePackages.push(corePackage)
//     }
//     for (const corePackage of corePackages) {
//       corePackage.addTsconfigsByCorePackages({ corePackages })
//     }

//     const modulesPackages: Mono0ModulePackage[] = []
//     const modulesPaths = await config.fs0.glob(config.modulesGlob, { onlyDirectories: true })
//     for (const modulePath of modulesPaths) {
//       const modulePackage = Mono0ModulePackage.create({
//         modulePath,
//         corePackages,
//       })
//       modulesPackages.push(modulePackage)
//     }

//     return new Mono0({ config, corePackages, modulesPackages, rootTsconfig, rootBaseTsconfig })
//   }

//   static async write() {
//     const mono0 = Mono0.mono0 || (await Mono0.init())
//     await mono0.rootTsconfig.write({ corePackages: mono0.corePackages, modulesPackages: mono0.modulesPackages })
//     await mono0.rootBaseTsconfig.write({ corePackages: mono0.corePackages, modulesPackages: mono0.modulesPackages })
//     for (const corePackage of mono0.corePackages) {
//       await corePackage.coreBaseTsconfig.write()
//       for (const tsconfig of corePackage.tsconfigs) {
//         await tsconfig.write({ corePackages: mono0.corePackages, modulesPackages: mono0.modulesPackages })
//       }
//     }
//   }
// }
