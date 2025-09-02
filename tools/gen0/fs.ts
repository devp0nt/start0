import fsSync from "node:fs"
import fs from "node:fs/promises"
import nodePath from "node:path"
import readline from "node:readline"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { globby } from "globby"

export class Gen0Fs {
  config: Gen0Config
  cwd: string

  private constructor(input: { config: Gen0Config } & ({ fileDir: string } | { filePath: string } | { cwd: string })) {
    this.config = input.config
    if ("fileDir" in input) {
      this.cwd = input.fileDir
    } else if ("filePath" in input) {
      this.cwd = nodePath.dirname(input.filePath)
    } else {
      this.cwd = input.cwd
    }
  }
  static create(input: { config: Gen0Config } & ({ fileDir: string } | { filePath: string } | { cwd: string })) {
    return new Gen0Fs(input)
  }

  async findFilesPaths<T extends Gen0Fs.PathOrPaths>({
    cwd = this.config.rootDir,
    glob,
    relative,
  }: {
    cwd?: string
    glob: T
    relative?: string | boolean
  }): Promise<string[]> {
    const paths = await globby(glob, { cwd, gitignore: true, absolute: true, dot: true })
    if (!relative) {
      return paths
    } else if (relative === true) {
      return paths.map((path) => this.toRel(path))
    } else {
      return paths.map((path) => this.toRel(path, relative))
    }
  }

  static isStringMatch(line: string | undefined, search: string | string[] | RegExp | RegExp[]): boolean {
    if (!line) return false
    if (Array.isArray(search)) {
      return search.some((item) => Gen0Fs.isStringMatch(line, item))
    } else if (typeof search === "string") {
      return line.includes(search)
    } else {
      return search.test(line)
    }
  }

  async contentMatch(path: string, search: string | string[] | RegExp | RegExp[]): Promise<boolean> {
    const pathNormalized = this.normalizePath(path)
    return new Promise((resolve, reject) => {
      const stream = fsSync.createReadStream(pathNormalized, { encoding: "utf8" })
      const rl = readline.createInterface({ input: stream })
      let found = false
      rl.on("line", (line) => {
        if (Gen0Fs.isStringMatch(line, search)) {
          found = true
          rl.close()
        }
      })
      rl.on("close", () => {
        resolve(found)
      })
      rl.on("error", (err) => {
        reject(err)
      })
    })
  }

  async findFilesPathsContentMatch<T extends Gen0Fs.PathOrPaths>({
    cwd = this.config.rootDir,
    glob,
    relative,
    search,
  }: {
    cwd?: string
    glob: T
    relative?: string | false
    search: string | string[] | RegExp | RegExp[]
  }) {
    const allPaths = await this.findFilesPaths({
      cwd,
      glob,
      relative,
    })
    const result = (
      await Promise.all(
        allPaths.map(async (path) => {
          if (await this.contentMatch(path, search)) {
            return path
          }
          return null
        }),
      )
    ).filter(Boolean) as string[]
    return result
  }

  toAbs<T extends Gen0Fs.PathOrPaths>(path: T, relativeTo: string = this.cwd): T {
    if (Array.isArray(path)) {
      return path.map((p) => this.toAbs(p)) as T
    }
    const pathNormalized = this.normalizePath(path)
    return nodePath.resolve(relativeTo, pathNormalized) as T
  }

  toRel<T extends Gen0Fs.PathOrPaths>(path: T, relativeTo?: string, withLeadingDot?: boolean): T
  toRel<T extends Gen0Fs.PathOrPaths>(path: T, withLeadingDot?: boolean, relativeTo?: string): T
  toRel<T extends Gen0Fs.PathOrPaths>(path: T, first?: any, second?: any): T {
    const relativeTo = typeof first === "string" ? first : typeof second === "string" ? second : this.cwd
    const withLeadingDot = typeof first === "boolean" ? first : typeof second === "boolean" ? second : true
    if (Array.isArray(path)) {
      return path.map((p) => this.toRel(p)) as T
    }
    const pathNormalized = this.normalizePath(path)
    const result = nodePath.relative(relativeTo, pathNormalized)
    if (withLeadingDot && !result.startsWith("../") && !result.startsWith("/") && !result.startsWith("./")) {
      return `./${result}` as T
    }
    return result as T
  }

  normalizePath(path: string) {
    if (/^~\//.test(path)) {
      return nodePath.resolve(this.config.rootDir, path.replace(/^~\//, ""))
    }
    if (/^~[a-zA-Z0-9_-]+/.test(path)) {
      return nodePath.resolve(this.config.rootDir, path.replace(/^~/, ""))
    }
    return path
  }

  parsePath(path: string, relativeTo: string = this.config.rootDir) {
    const abs = this.toAbs(path)
    const rel = this.toRel(path, relativeTo, false)
    const relDotted = this.toRel(path, relativeTo, true)
    const extDotted = nodePath.extname(path)
    const ext = extDotted.replace(/^\./, "")
    const name = nodePath.basename(path)
    const basename = nodePath.basename(path, extDotted)
    const dir = nodePath.dirname(path)
    const dirname = nodePath.basename(dir)
    return { abs, rel, relDotted, name, ext, extDotted, basename, dir, dirname }
  }

  writeFileSync(path: string, content: string) {
    const pathNormalized = this.normalizePath(path)
    fsSync.writeFileSync(pathNormalized, content)
  }

  async writeFile(path: string, content: string) {
    const pathNormalized = this.normalizePath(path)
    await fs.writeFile(pathNormalized, content)
  }

  readFileSync(path: string) {
    const pathNormalized = this.normalizePath(path)
    return fsSync.readFileSync(pathNormalized, "utf8")
  }

  async readFile(path: string) {
    const pathNormalized = this.normalizePath(path)
    return await fs.readFile(pathNormalized, "utf8")
  }
}

export namespace Gen0Fs {
  export type PathOrPaths = string | string[]
  export type PathParsed = ReturnType<typeof Gen0Fs.prototype.parsePath>
}
