import fs from "node:fs/promises"
import nodePath from "node:path"
import vm from "node:vm"
import { findUpSync } from "find-up"
import { globby } from "globby"
import _ from "lodash"

// TODO: better parsing, and spaces before finish
// TODO: bin file
// TODO: find all files using gen0
// TODO: add logger
// TODO: watchers
// TODO: parse config file
// TODO: after process cmd
// TODO: many config extensions
// TODO: runner as class
// TODO: plugin as class
// TODO: bin to bin in package.json

export class Gen0 {
  static ctx: Record<string, any> = {}
  static watchers: Record<string, (ctx: Gen0.RunnerCtx) => void | Promise<void>> = {}
  static pluginsGlob: string = "./**/*.gen0.*"

  configPath: string
  projectRootDir: string

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
    await gen0.applyPlugins()
    return gen0
  }

  // runner

  async processFile({ path }: { path: string }) {
    const srcContent = await fs.readFile(path, "utf8")
    const distContent = await this.generateFileContent({ srcContent, path })
    await fs.writeFile(path, distContent)
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

  getRunnerCtx({ target, store }: { target: Gen0.Target; store: Gen0.RunnerStore }) {
    const prints: string[] = []
    const specialFns = {
      print: (print: string) => {
        prints.push(print)
      },
      glob: <T extends string | string[]>(glob: T, relative: string | boolean = true) => {
        const absGlob = this.absPath({ cwd: target.fileDir, path: glob })
        return this.findFilesPaths({ glob: absGlob, relative: relative === true ? target.fileDir : relative })
      },
      fromRelative: (path: string) => {
        return nodePath.resolve(target.fileDir, path)
      },
      toRelative: (path: string) => {
        return Gen0.relativePath({ cwd: target.fileDir, path: path })
      },
      _,
    }
    const ctx: Gen0.RunnerCtx = {
      ...Gen0.ctx,
      ...specialFns,
      gen0: this,
      prints,
      console,
      filePath: target.filePath,
      fileDir: target.fileDir,
      store,
    }
    // bind ctx itself to all functions as first argument
    for (const key of Object.keys(ctx)) {
      if (key in specialFns) {
        continue
      }
      if (typeof ctx[key] === "function") {
        ctx[key] = ctx[key].bind(this, ctx)
      }
    }
    return ctx
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
    return await this.findFilesPathsWithContent({ glob: ["**/*.ts", "!**/gen0/index.ts"], search: "// /gen0 " })
  }

  async processClients() {
    return await this.findClientsPaths().then((clientsPaths) => {
      return Promise.all(clientsPaths.map((clientPath) => this.processFile({ path: clientPath })))
    })
  }

  // config

  static getConfigPath = ({ cwd }: { cwd: string }) => {
    return findUpSync([".gen0.mjs"], { cwd })
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
    const paths = await globby(glob, { cwd, gitignore: true, absolute: true })
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
