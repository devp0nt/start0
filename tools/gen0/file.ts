import fsSync from "node:fs"
import fs from "node:fs/promises"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"

export class Gen0File {
  static logger = Gen0Logger.create1("file")
  logger = Gen0File.logger

  config: Gen0Config
  path: Gen0Fs.PathParsed
  fs: Gen0Fs

  private constructor({ filePath, config }: { filePath: string; config: Gen0Config }) {
    this.config = config
    this.fs = Gen0Fs.create({ config, filePath })
    this.path = this.fs.parsePath(filePath)
  }

  static create({ filePath, config }: { filePath: string; config: Gen0Config }) {
    return new Gen0File({ filePath, config })
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

  async import() {
    return await import(this.path.abs)
  }
}
