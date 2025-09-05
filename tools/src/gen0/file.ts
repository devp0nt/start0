import fsSync from "node:fs"
import fs from "node:fs/promises"
import type { Gen0Config } from "@/tools/gen0/config"
import { Gen0Fs } from "@/tools/gen0/fs"
import { Gen0Logger } from "@/tools/gen0/logger"
import type { Gen0Utils } from "@/tools/gen0/utils"

// TODO: use File0 and Fs0

export class Gen0File {
  static logger = Gen0Logger.create("file")
  logger = Gen0File.logger

  path: Gen0Fs.PathParsed
  fs: Gen0Fs

  private constructor({ filePath, fs }: { filePath: string; fs: Gen0Fs }) {
    this.fs = fs
    this.path = this.fs.parsePath(filePath)
  }

  static create(props: { filePath: string; fs: Gen0Fs }): Gen0File
  static create(props: { filePath: string; config: Gen0Config }): Gen0File
  static create({ filePath, fs, config }: { filePath: string; fs?: Gen0Fs; config?: Gen0Config }) {
    fs = (() => {
      if (fs) {
        return fs
      }
      if (config) {
        return Gen0Fs.create({ config, filePath })
      }
      throw new Error("fs or config is required")
    })()
    return new Gen0File({ filePath, fs })
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

  async importFresh<T = any>(): Promise<T> {
    return await import(`${this.path.abs}?t=${Date.now()}`)
  }

  async importFreshDefault<T = any>(): Promise<T> {
    return (await import(`${this.path.abs}?t=${Date.now()}`).then((m) => m.default)) as T
  }

  async isContentMatch(search: Gen0Utils.Search) {
    return await this.fs.isContentMatch(this.path.abs, search)
  }
}
