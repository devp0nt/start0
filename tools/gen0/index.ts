import { exec } from "node:child_process"
import fs from "node:fs/promises"
import nodePath from "node:path"
import vm from "node:vm"
import chokidar from "chokidar"
import { findUpSync } from "find-up"
import { globby, isGitIgnored, isGitIgnoredSync } from "globby"
import _ from "lodash"

// TODO: named actions
// TODO: plugin inport from files
// TODO: export name without ending
// TODO: remove forced new line after first comment
// TODO: boime ignore organize imports
// TODO: watchers
// TODO: typed ctx
// TODO: better parsing, and spaces before finish
// TODO: check if we need static props at all
// TODO: bin file
// TODO: find all files using
// TODO: add logger
// TODO: project root in config
// TODO: many config extensions
// TODO: runner as class
// TODO: plugin as class
// TODO: bin to bin in package.json
// TODO: respect nodepath in globs
// TODO: print inline
// TODO: prim space count

export class Gen0 {
  static ctx: Record<string, any> = {}
  static watchers: Record<string, (ctx: Gen0.RunnerCtx) => void | Promise<void>> = {}
  static pluginsGlob: string | string[] = ["**/*.gen0.*"]
  static clientsGlob: string | string[] = ["**/*.{ts,tsx,js,jsx,mjs}", "!**/gen0/index.ts"]
  static plugins: Record<string, Gen0.Plugin> = {}

  pluginsGlob = Gen0.pluginsGlob
  clientsGlob = Gen0.clientsGlob

  configPath: string
  projectRootDir: string
  afterProcessCmd: string | ((filePath: string) => string) | undefined = undefined
  isIgnored: (path: string) => boolean = (path) => false

  constructor({ cwd = process.cwd() }: { cwd?: string } = {}) {
    const configPath = Gen0.getConfigPath({ cwd })
    if (!configPath) {
      throw new Error("gen0 config file not found")
    }
    this.configPath = configPath
    this.projectRootDir = Gen0.getProjectRootDir({ configPath })
  }

  static async init({ cwd }: { cwd?: string } = {}) {
    const gen0 = new Gen0({ cwd })
    const config = await Gen0.parseConfig({ configPath: gen0.configPath })
    gen0.isIgnored = await isGitIgnored({ cwd: gen0.projectRootDir })
    gen0.afterProcessCmd = config.afterProcessCmd || gen0.afterProcessCmd
    await gen0.applyPlugins()
    return gen0
  }

  // watchers

  async watch() {
    chokidar
      .watch(this.projectRootDir, {
        cwd: this.projectRootDir,
        ignored: this.isIgnored,
        ignoreInitial: true,
        persistent: true,
      })
      .on("add", (path) => {
        console.log("all", path)
      })
      .on("change", (path) => {
        console.log("change", path)
      })
      .on("unlink", (path) => {
        console.log("unlink", path)
      })
      .on("addDir", (path) => {
        console.log("addDir", path)
      })
      .on("unlinkDir", (path) => {
        console.log("unlinkDir", path)
      })
      .on("error", (error) => {
        console.log("error", error)
      })
      .on("ready", () => {
        console.log("ready")
      })
  }

  // runner

  async processFile({ path }: { path: string }) {
    const srcContent = await fs.readFile(path, "utf8")
    const distContent = await this.generateFileContent({ srcContent, path })
    await fs.writeFile(path, distContent)
    if (this.afterProcessCmd) {
      const afterProcessCmd =
        typeof this.afterProcessCmd === "function" ? this.afterProcessCmd(path) : this.afterProcessCmd
      await exec(afterProcessCmd, { cwd: this.projectRootDir })
    }
  }

  async generateFileContent({ srcContent, path }: { srcContent: string; path: string }) {
    let distContent = srcContent
    let target = Gen0.getTarget({ srcContent: distContent, skipBeforePos: 0, path })
    const store: Gen0.RunnerStore = {}
    while (target) {
      const targetOutput = await this.generateTargetOutput({ target, store })
      distContent = Gen0.injectTargetOutput({ target, output: targetOutput, srcContent: distContent })
      target = Gen0.getTarget({ srcContent: distContent, skipBeforePos: target.outputEndPos, path })
    }
    return distContent
  }

  static getTarget({
    srcContent,
    skipBeforePos = 0,
    path,
  }: {
    srcContent: string
    skipBeforePos?: number
    path: string
  }): Gen0.Target | null {
    const startString = "// /gen0 "
    const endString = "// gen0/"
    const definitionStartPos = srcContent.indexOf(startString, skipBeforePos)
    if (definitionStartPos === -1) {
      return null
    }
    const definitionEndPos = srcContent.indexOf(endString, definitionStartPos)
    if (definitionEndPos === -1) {
      throw new Error(`gen0 target end not found, you forget to add "${endString}" in file "${path}"`)
    }
    const nextDefinitionStartPos = srcContent.indexOf(startString, definitionStartPos + 1)
    if (nextDefinitionStartPos !== -1 && nextDefinitionStartPos < definitionEndPos) {
      throw new Error(`gen0 target end not found, you forget to add "${endString}" in file "${path}"`)
    }
    // from "// gen0 " to end of line
    const scriptStartPos = definitionStartPos + startString.length
    const scriptEndPos = srcContent.indexOf("\n", scriptStartPos)
    const scriptContent = srcContent.substring(scriptStartPos, scriptEndPos)
    // next line after scriptEndPos
    const scriptDefinitionEndPos = scriptEndPos
    const outputStartPos = scriptDefinitionEndPos
    const outputEndPos = definitionEndPos
    return {
      filePath: path,
      fileDir: nodePath.dirname(path),
      scriptContent,
      outputStartPos,
      outputEndPos,
    }
  }

  async generateTargetOutput({ target, store }: { target: Gen0.Target; store: Gen0.RunnerStore }) {
    const runnerCtx = this.getRunnerCtx({ target, store })
    const vmContex = vm.createContext(runnerCtx)
    const wrappedScript = `
      ;(async () => {
        try {
          ${target.scriptContent}
        } catch (error) {
          console.error(error)
        }
      })()
    `
    await vm.runInContext(wrappedScript, vmContex)
    // TODO: pass all consolwe.logs to console.log outside
    const distContent = runnerCtx.prints.join("\n")
    return distContent
  }

  static injectTargetOutput({
    target,
    output,
    srcContent,
  }: {
    target: Gen0.Target
    output: string
    srcContent: string
  }): string {
    return (
      srcContent.substring(0, target.outputStartPos) +
      "\n\n" +
      output +
      "\n" +
      srcContent.substring(target.outputEndPos)
    )
  }

  // plugins

  async findPluginsPaths() {
    return await Gen0.findFilesPaths({ cwd: this.projectRootDir, glob: Gen0.pluginsGlob, relative: false })
  }

  static definePlugin(plugin: Gen0.Plugin): Gen0.Plugin {
    return plugin
  }

  async applyPlugin(plugin: Gen0.Plugin) {
    const pluginResult = typeof plugin === "function" ? await plugin(this) : plugin
    if (pluginResult.ctx) {
      for (const key of Object.keys(pluginResult.ctx)) {
        Gen0.ctx[key] = pluginResult.ctx[key]
      }
    }
  }

  async applyPlugins() {
    const pluginsPaths = await this.findPluginsPaths()
    for (const pluginPath of pluginsPaths) {
      const plugin = await import(pluginPath)
      const pluginNormalized = plugin.default || plugin
      if (pluginNormalized) {
        await this.applyPlugin(pluginNormalized)
      }
    }
  }

  // clients

  async findClientsPaths() {
    return await this.findFilesPathsWithContent({
      glob: this.clientsGlob,
      search: "// /gen0 ",
    })
  }

  async processClients() {
    return await this.findClientsPaths().then((clientsPaths) => {
      return Promise.all(clientsPaths.map((clientPath) => this.processFile({ path: clientPath })))
    })
  }

  // config

  static getConfigPath = ({ cwd }: { cwd: string }) => {
    return findUpSync([".gen0rc.mjs", ".gen0rc.ts", ".gen0rc.js"], { cwd })
  }

  static async parseConfig({ configPath }: { configPath: string }) {
    const config = await import(configPath)
    return config.default || config
  }

  // utils

  static async findFilesPaths<T extends string | string[]>({
    cwd,
    glob,
    relative,
  }: {
    cwd: string
    glob: T
    relative?: string | false
  }): Promise<string[]> {
    const paths = await globby(glob, { cwd, gitignore: true, absolute: true, dot: true })
    if (!relative) {
      return paths
    } else {
      return paths.map((path) => Gen0.relativePath({ cwd: relative, path: path }))
    }
  }

  async findFilesPaths<T extends string | string[]>({ glob, relative }: { glob: T; relative?: string | false }) {
    return await Gen0.findFilesPaths({
      cwd: this.projectRootDir,
      glob,
      relative,
    })
  }

  static async findFilesPathsWithContent<T extends string | string[]>({
    cwd,
    glob,
    relative,
    search,
  }: {
    cwd: string
    glob: T
    relative?: string | false
    search: string
  }) {
    const allPaths = await Gen0.findFilesPaths({
      cwd,
      glob,
      relative,
    })
    const result = (
      await Promise.all(
        allPaths.map(async (path) => {
          const content = await fs.readFile(path, "utf8")
          if (content.includes(search)) {
            return path
          }
          return null
        }),
      )
    ).filter(Boolean) as string[]
    return result
  }

  async findFilesPathsWithContent<T extends string | string[]>({
    glob,
    relative,
    search,
  }: {
    glob: T
    relative?: string | false
    search: string
  }) {
    return await Gen0.findFilesPathsWithContent({
      cwd: this.projectRootDir,
      glob,
      relative,
      search,
    })
  }

  static getProjectRootDir = ({ configPath }: { configPath: string }) => {
    return nodePath.dirname(configPath)
  }

  static absPath = <T extends string | string[]>({
    projectRootDir,
    cwd,
    path,
  }: {
    projectRootDir: string
    cwd: string
    path: T
  }): T => {
    if (Array.isArray(path)) {
      return path.map((p) => Gen0.absPath({ projectRootDir, cwd, path: p })) as T
    }
    if (path.startsWith("~/")) {
      return nodePath.resolve(cwd, nodePath.join(projectRootDir, path.replace(/^~\//, ""))) as T
    }
    return nodePath.resolve(cwd, path) as T
  }

  absPath<T extends string | string[]>({ cwd, path }: { cwd: string; path: T }): T {
    return Gen0.absPath({ projectRootDir: this.projectRootDir, cwd, path: path }) as T
  }

  static relativePath<T extends string | string[]>({ cwd, path }: { cwd: string; path: T }): T {
    if (Array.isArray(path)) {
      return path.map((p) => Gen0.relativePath({ cwd, path: p })) as T
    }
    const result = nodePath.relative(cwd, path)
    if (!result.startsWith("../") && !result.startsWith("/") && !result.startsWith("./")) {
      return `./${result}` as T
    }
    return result as T
  }
}

export namespace Gen0 {
  export type Config = {
    afterProcessCmd?: (filePath: string) => string
    plugins?: Record<string, Gen0.Plugin>
  }

  export type Watcher = {
    trigger: string | string[]
    client: string | string[]
  }

  export type Target = {
    filePath: string
    fileDir: string
    scriptContent: string
    outputStartPos: number
    outputEndPos: number
  }
  export type RunnerCtx = Record<string, any> & {
    prints: string[]
    print: (print: string) => void
    glob: <T extends string | string[]>(glob: T, relative?: string | boolean) => Promise<string[]>
    gen0: Gen0
    filePath: string
    fileDir: string
    fromRelative: (path: string) => string
    toRelative: (path: string) => string
    store: RunnerStore
    _: typeof _
  }
  export type RunnerStore = Record<string, any>

  export type PluginGetter = (gen0: Gen0) => PluginResult
  export type PluginResult = {
    ctx?: Record<string, (ctx: RunnerCtx, ...args: any[]) => any | Promise<any>>
  }
  export type Plugin = PluginGetter | PluginResult
}
