import fsSync from "node:fs"
import fs from "node:fs/promises"
import nodePath from "node:path"
import readline from "node:readline"
import { Gen0Utils } from "@ideanick/tools/gen0/utils"
import dotenv from "dotenv"
import { findUp, findUpSync } from "find-up"
import { type Options as GlobbyOptions, globby, globbySync } from "globby"
import micromatch from "micromatch"

export class Fs0 {
  rootDir: string
  cwd: string

  private constructor(input: Fs0.CreateFsInput = {}) {
    if ("fileDir" in input && input.fileDir) {
      this.cwd = input.fileDir
    } else if ("filePath" in input && input.filePath) {
      this.cwd = nodePath.dirname(input.filePath)
    } else if ("cwd" in input && input.cwd) {
      this.cwd = input.cwd
    } else {
      this.cwd = process.cwd()
    }
    this.rootDir = input.rootDir || this.cwd
    if (!this.rootDir.startsWith("/")) {
      throw new Error("Root dir must be absolute")
    }
    this.cwd = nodePath.resolve(this.rootDir, this.cwd)
  }
  static create(input: Fs0.CreateFsInput = {}) {
    return new Fs0(input)
  }
  create(input: Fs0.CreateFsInput = {}) {
    let cwd: undefined | string
    if ("fileDir" in input && input.fileDir) {
      cwd = this.resolve(input.fileDir)
    } else if ("filePath" in input && input.filePath) {
      cwd = this.resolve(nodePath.dirname(input.filePath))
    } else if ("cwd" in input && input.cwd) {
      cwd = this.resolve(input.cwd)
    }
    const rootDir = input.rootDir || this.rootDir
    return Fs0.create({ ...input, rootDir, cwd })
  }

  static isStringMatch = (str: string | undefined, search: Fs0.StringMatchInput): boolean => {
    if (!str) return false
    if (Array.isArray(search)) {
      return search.some((item) => Fs0.isStringMatch(str, item))
    } else if (typeof search === "string") {
      return str.includes(search)
    } else {
      return search.test(str)
    }
  }

  async findFilesPaths(glob: Fs0.PathOrPaths): Promise<string[]>
  async findFilesPaths({
    cwd,
    glob,
    relative,
  }: {
    cwd?: string
    glob: Fs0.PathOrPaths
    relative?: string | boolean
  }): Promise<string[]>
  async findFilesPaths(
    input:
      | Fs0.PathOrPaths
      | {
          cwd?: string
          glob: Fs0.PathOrPaths
          relative?: string | boolean
        },
  ): Promise<string[]> {
    const { cwd, glob, relative } = (() => {
      if (typeof input === "string" || Array.isArray(input)) {
        return {
          cwd: this.rootDir,
          glob: this.toPaths(input),
          relative: undefined,
        }
      }
      if (typeof input === "object" && input !== null) {
        return {
          cwd: input.cwd || this.rootDir,
          glob: this.toPaths(input.glob),
          relative: input.relative,
        }
      }
      throw new Error("Invalid input")
    })()
    const paths = await globby(glob, { cwd, gitignore: true, absolute: true, dot: true })
    if (!relative) {
      return paths
    } else if (relative === true) {
      return paths.map((path) => this.toRel(path))
    } else {
      return paths.map((path) => this.toRel(path, relative))
    }
  }

  findFilesPathsSync(glob: Fs0.PathOrPaths): string[]
  findFilesPathsSync({
    cwd,
    glob,
    relative,
  }: {
    cwd?: string
    glob: Fs0.PathOrPaths
    relative?: string | boolean
  }): string[]
  findFilesPathsSync(
    input:
      | Fs0.PathOrPaths
      | {
          cwd?: string
          glob: Fs0.PathOrPaths
          relative?: string | boolean
        },
  ): string[] {
    const { cwd, glob, relative } = (() => {
      if (typeof input === "string" || Array.isArray(input)) {
        return {
          cwd: this.rootDir,
          glob: this.toPaths(input),
          relative: undefined,
        }
      }
      if (typeof input === "object" && input !== null) {
        return {
          cwd: input.cwd || this.rootDir,
          glob: this.toPaths(input.glob),
          relative: input.relative,
        }
      }
      throw new Error("Invalid input")
    })()
    const paths = globbySync(glob, { cwd, gitignore: true, absolute: true, dot: true })
    if (!relative) {
      return paths
    } else if (relative === true) {
      return paths.map((path) => this.toRel(path))
    } else {
      return paths.map((path) => this.toRel(path, relative))
    }
  }

  async glob(
    glob: string,
    {
      cwd = this.rootDir,
      relative,
      ...restOptions
    }: {
      cwd?: string
      relative?: string | boolean
    } & GlobbyOptions = {},
  ): Promise<string[]> {
    const paths = await globby(glob, { gitignore: true, absolute: true, dot: true, ...restOptions })
    if (!relative) {
      return paths
    } else if (relative === true) {
      return paths.map((path) => this.toRel(path))
    } else {
      return paths.map((path) => this.toRel(path, relative))
    }
  }

  async isContentMatch(path: string, search: Gen0Utils.Search): Promise<boolean> {
    const pathNormalized = this.normalizePath(path)
    return new Promise((resolve, reject) => {
      const stream = fsSync.createReadStream(pathNormalized, { encoding: "utf8" })
      const rl = readline.createInterface({ input: stream })
      let found = false
      rl.on("line", (line) => {
        if (Gen0Utils.isStringMatch(line, search)) {
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

  async findFilesPathsContentMatch({
    cwd = this.rootDir,
    glob,
    relative,
    search,
  }: {
    cwd?: string
    glob: Fs0.PathOrPaths
    relative?: string | false
    search: Gen0Utils.Search
  }) {
    const allPaths = await this.findFilesPaths({
      cwd,
      glob,
      relative,
    })
    const result = (
      await Promise.all(
        allPaths.map(async (path) => {
          if (await this.isContentMatch(path, search)) {
            return path
          }
          return null
        }),
      )
    ).filter(Boolean) as string[]
    return result
  }

  async ensureFilesPathsContentMatch({
    cwd = this.rootDir,
    path,
    relative,
    search,
  }: {
    cwd?: string
    path: Fs0.PathOrPaths
    relative?: string | false
    search: Gen0Utils.Search
  }) {
    const allPaths = this.toPaths(path)
    const result = (
      await Promise.all(
        allPaths.map(async (path) => {
          if (await this.isContentMatch(path, search)) {
            return path
          }
          return null
        }),
      )
    ).filter(Boolean) as string[]
    return result
  }

  toAbs<T extends Fs0.PathOrPaths>(path: T, relativeToAbs: string = this.cwd): T {
    if (Array.isArray(path)) {
      return path.map((p) => this.toAbs(p)) as T
    }
    if (path.startsWith("!")) {
      const cutted = path.replace(/^!/, "")
      const result = this.toAbs(cutted, relativeToAbs)
      return `!${result}` as T
    }
    const pathNormalized = this.normalizePath(path)
    return nodePath.resolve(relativeToAbs, pathNormalized) as T
  }

  toRel<T extends Fs0.PathOrPaths>(path: T, relativeTo?: string, withLeadingDot?: boolean): T
  toRel<T extends Fs0.PathOrPaths>(path: T, withLeadingDot?: boolean, relativeTo?: string): T
  toRel<T extends Fs0.PathOrPaths>(path: T, first?: any, second?: any): T {
    const relativeTo = typeof first === "string" ? first : typeof second === "string" ? second : this.cwd
    const withLeadingDot = typeof first === "boolean" ? first : typeof second === "boolean" ? second : true
    if (Array.isArray(path)) {
      return path.map((p) => this.toRel(p)) as T
    }
    if (path.startsWith("!")) {
      const cutted = path.replace(/^!/, "")
      const result = this.toRel(cutted, first, second)
      return `!${result}` as T
    }
    const pathNormalized = this.normalizePath(path)
    const result = nodePath.relative(relativeTo, pathNormalized)
    if (withLeadingDot && !result.startsWith("../") && !result.startsWith("/") && !result.startsWith("./")) {
      return `./${result}` as T
    }
    return result as T
  }

  parsePath(path: string, relativeTo: string = this.rootDir) {
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

  replaceExt(path: string, ext: string) {
    const originalExt = nodePath.extname(path)
    if (!ext.startsWith(".")) {
      ext = `.${ext}`
    }
    return path.replace(new RegExp(`${originalExt}$`), ext)
  }

  writeFileSync(path: string, content: string) {
    fsSync.writeFileSync(this.normalizePath(path), content)
  }

  async writeFile(path: string, content: string) {
    path = this.normalizePath(path)
    await fs.mkdir(nodePath.dirname(path), { recursive: true })
    await fs.writeFile(path, content)
  }

  readFileSync(path: string) {
    return fsSync.readFileSync(this.normalizePath(path), "utf8")
  }

  async readFile(path: string) {
    return await fs.readFile(this.normalizePath(path), "utf8")
  }

  resolve(...paths: string[]): string {
    paths = paths.map((path) => this.normalizePath(path))
    return nodePath.resolve(this.cwd, ...paths)
  }

  basename(path: string): string {
    return nodePath.basename(this.normalizePath(path))
  }

  basenameWithoutExt(path: string): string {
    return nodePath.basename(this.normalizePath(path), nodePath.extname(path))
  }

  isDirectorySync(path: string): boolean {
    try {
      return fsSync.statSync(this.normalizePath(path)).isDirectory()
    } catch {
      return false
    }
  }

  async isDirectory(path: string): Promise<boolean> {
    try {
      return (await fs.stat(this.normalizePath(path))).isDirectory()
    } catch {
      return false
    }
  }

  isFileSync(path: string): boolean {
    try {
      return fsSync.statSync(this.normalizePath(path)).isFile()
    } catch {
      return false
    }
  }

  async isFile(path: string): Promise<boolean> {
    try {
      return (await fs.stat(this.normalizePath(path))).isFile()
    } catch {
      return false
    }
  }

  isExistsSync(path: string): boolean {
    try {
      return fsSync.existsSync(this.normalizePath(path))
    } catch {
      return false
    }
  }

  async isExists(path: string): Promise<boolean> {
    try {
      return await fs.exists(this.normalizePath(path))
    } catch {
      return false
    }
  }

  normalizePath(path: string): string {
    if (path.startsWith("!")) {
      const result = this.normalizePath(path.replace(/^!/, ""))
      return `!${result}`
    }
    if (/^~\//.test(path)) {
      return nodePath.resolve(this.rootDir, path.replace(/^~\//, ""))
    }
    if (/^~[a-zA-Z0-9_-]+/.test(path)) {
      return nodePath.resolve(this.rootDir, path.replace(/^~/, ""))
    }
    return path
  }

  toPaths(path: Fs0.PathOrPaths): string[] {
    return Array.isArray(path) ? path.map(this.normalizePath.bind(this)) : [this.normalizePath(path)]
  }

  isPathMatchGlob(path: string, glob: string | string[]): boolean {
    const pathNormalized = this.normalizePath(path)
    const globNormalized = Array.isArray(glob) ? glob.map(this.normalizePath.bind(this)) : [this.normalizePath(glob)]
    const negativeGlobs = globNormalized.filter((g) => g.startsWith("!")).map((g) => g.replace(/^!/, ""))
    const positiveGlobs = globNormalized.filter((g) => !g.startsWith("!"))
    const isMatchPositive = micromatch.isMatch(pathNormalized, positiveGlobs)
    const isMatchNegative = micromatch.isMatch(pathNormalized, negativeGlobs)
    return isMatchPositive && !isMatchNegative
  }

  isPathInDir(path: string, dir: string): boolean {
    const pathNormalized = this.toAbs(path)
    const dirNormalized = this.toAbs(dir)
    return pathNormalized.startsWith(dirNormalized) && pathNormalized !== dirNormalized
  }

  async findUp(filename: string): Promise<string | undefined> {
    return await findUp(filename, { cwd: this.cwd })
  }

  findUpSync(filename: string): string | undefined {
    return findUpSync(filename, { cwd: this.cwd })
  }

  async findUpFile(filename: string): Promise<File0 | undefined> {
    const path = await findUp(filename, { cwd: this.cwd })
    if (!path) {
      return undefined
    }
    return File0.create({ filePath: path, rootDir: this.rootDir })
  }
  static async findUpFile(filename: string, createFsInput?: Fs0.CreateFsInput) {
    const fs0 = Fs0.create(createFsInput)
    return await fs0.findUpFile(filename)
  }

  findUpFileSync(filename: string): File0 | undefined {
    const path = findUpSync(filename, { cwd: this.cwd })
    if (!path) {
      return undefined
    }
    return File0.create({ filePath: path, rootDir: this.rootDir })
  }

  async loadEnv(filename: string = ".env"): Promise<Record<string, string>> {
    return dotenv.config({ path: await this.findUp(filename) }).parsed as Record<string, string>
  }

  loadEnvSync(filename: string = ".env"): Record<string, string> {
    return dotenv.config({ path: this.findUpSync(filename) }).parsed as Record<string, string>
  }

  async importFresh<T = any>(path: string): Promise<T> {
    path = this.toAbs(path)
    return await import(`${path}?t=${Date.now()}`)
  }

  async importFreshDefault<T = any>(path: string): Promise<T> {
    path = this.toAbs(path)
    return (await import(`${path}?t=${Date.now()}`).then((m) => m.default)) as T
  }

  async rm(path: string) {
    try {
      await fs.rm(path)
    } catch {}
  }

  rmSync(path: string) {
    try {
      fsSync.rmSync(path)
    } catch {}
  }

  async rmdir(path: string) {
    try {
      await fs.rmdir(path, { recursive: true })
    } catch {}
  }

  rmdirSync(path: string) {
    try {
      fsSync.rmdirSync(path, { recursive: true })
    } catch {}
  }

  createFile0(filePath: string): File0 {
    filePath = this.toAbs(filePath)
    return File0.create({ filePath, rootDir: this.rootDir })
  }

  node = fs
  nodeSync = fsSync
}

export class File0 {
  path: Fs0.PathParsed
  fs0: Fs0

  private constructor({ filePath, fs0 }: { filePath: string; fs0: Fs0 }) {
    this.fs0 = fs0
    this.path = this.fs0.parsePath(filePath)
  }

  static create({ filePath, rootDir }: { filePath: string; rootDir?: string }): File0 {
    const fs0 = Fs0.create({
      filePath,
      rootDir,
    })
    return new File0({ filePath, fs0 })
  }

  writeSync(content: string) {
    return this.fs0.writeFileSync(this.path.abs, content)
  }

  async write(content: string) {
    return this.fs0.writeFile(this.path.abs, content)
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
    return await this.fs0.isContentMatch(this.path.abs, search)
  }
}

export namespace Fs0 {
  export type CreateFsInput = { rootDir?: string } & ({ fileDir?: string } | { filePath?: string } | { cwd?: string })
  export type Path = string
  export type Paths = string[]
  export type PathOrPaths = Path | Paths
  export type PathParsed = ReturnType<typeof Fs0.prototype.parsePath>
  export type StringMatchInput = string | string[] | RegExp | RegExp[]
}
