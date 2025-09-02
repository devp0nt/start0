import { Gen0ClientCtx } from "@ideanick/tools/gen0/clientCtx"
import { Gen0File } from "@ideanick/tools/gen0/file"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"

export class Gen0Client extends Gen0File {
  ctx: Gen0ClientCtx

  constructor({ filePath, rootDir }: { filePath: string; rootDir: string }) {
    super({ filePath, rootDir })
    this.ctx = Gen0ClientCtx.create({ clientPath: this.path.abs, rootDir: this.rootDir })
  }

  pruneCtx() {
    this.ctx = Gen0ClientCtx.create({ clientPath: this.path.abs, rootDir: this.rootDir })
  }

  process() {
    // TODO: din targets, run scripts
  }
}

export namespace Gen0Client {
  export type PathOrPaths = string | string[]
  export type PathParsed = ReturnType<typeof Gen0Fs.prototype.parsePath>
}
