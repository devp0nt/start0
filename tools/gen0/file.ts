import fsSync from "node:fs"
import fs from "node:fs/promises"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"

export class Gen0File {
  rootDir: string
  path: Gen0Fs.PathParsed
  fs: Gen0Fs

  constructor({ filePath, rootDir }: { filePath: string; rootDir: string }) {
    this.rootDir = rootDir
    this.fs = Gen0Fs.create({ rootDir: this.rootDir, filePath })
    this.path = this.fs.parsePath(filePath)
  }

  writeSync(content: string) {
    return this.fs.writeFileSync(this.path.abs, content)
  }

  async write(content: string) {
    return this.fs.writeFile(this.path.abs, content)
  }

  readSync() {
    return fsSync.readFileSync(this.path.abs, "utf8")
  }

  async read() {
    return await fs.readFile(this.path.abs, "utf8")
  }
}
