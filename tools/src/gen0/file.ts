// import fsSync from "node:fs"
// import fs from "node:fs/promises"
// import type { Gen0Config } from "@/tools/gen0/config"
// import { Fs0 } from "@/tools/fs0"
// import { Gen0Logger } from "@/tools/gen0/logger"
// import type { Gen0Utils } from "@/tools/gen0/utils"

// // TODO: use File0 and Fs0

// export class File0 {
//   static logger = Gen0Logger.create("file")
//   logger = File0.logger

//   path: Fs0.PathParsed
//   fs: Fs0

//   private constructor({ filePath, fs }: { filePath: string; fs: Fs0 }) {
//     this.fs = fs
//     this.path = this.fs.parsePath(filePath)
//   }

//   static create(props: { filePath: string; fs: Fs0 }): File0
//   static create(props: { filePath: string; config: Gen0Config }): File0
//   static create({ filePath, fs, config }: { filePath: string; fs?: Fs0; config?: Gen0Config }) {
//     fs = (() => {
//       if (fs) {
//         return fs
//       }
//       if (config) {
//         return Fs0.create({ config, filePath })
//       }
//       throw new Error("fs or config is required")
//     })()
//     return new File0({ filePath, fs })
//   }

//   writeSync(content: string) {
//     return this.fs.writeFileSync(this.path.abs, content)
//   }

//   async write(content: string) {
//     return this.fs.writeFile(this.path.abs, content)
//   }

//   readSync() {
//     return fsSync.readFileSync(this.path.abs, "utf8")
//   }

//   async read() {
//     return await fs.readFile(this.path.abs, "utf8")
//   }

//   async importFresh<T = any>(): Promise<T> {
//     return await import(`${this.path.abs}?t=${Date.now()}`)
//   }

//   async importFreshDefault<T = any>(): Promise<T> {
//     return (await import(`${this.path.abs}?t=${Date.now()}`).then((m) => m.default)) as T
//   }

//   async isContentMatch(search: Gen0Utils.Search) {
//     return await this.fs.isContentMatch(this.path.abs, search)
//   }
// }
