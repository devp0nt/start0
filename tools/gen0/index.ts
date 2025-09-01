import fs from "node:fs/promises"
import nodePath from "node:path"
import vm from "node:vm"
import { findUpSync } from "find-up"
import { globby } from "globby"

// TODO: watchers
// TODO: parse config file
// TODO: many config extensions
// TODO: runner as class
// TODO: plugin as class

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
    const storage: Gen0.RunnerStorage = {}
    while (target) {
      const targetOutput = await this.generateTargetOutput({ target, storage })
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

  async generateTargetOutput({ target, storage }: { target: Gen0.Target; storage: Gen0.RunnerStorage }) {
    const runnerCtx = this.getRunnerCtx({ target, storage })
    const vmContex = vm.createContext(runnerCtx)
    await vm.runInContext(target.scriptContent, vmContex)
    const distContent = runnerCtx.prints.join("\n")
    return distContent
  }

  getRunnerCtx({ target, storage }: { target: Gen0.Target; storage: Gen0.RunnerStorage }) {
    const prints: string[] = []
    const specialFns = {
      print: (print: string) => {
        prints.push(print)
      },
      glob: (glob: string, relative = true) => {
        const absGlob = this.absPath({ cwd: this.projectRootDir, path: glob })
        return this.findFilesPaths({ glob: absGlob, relative: relative === true ? target.fileDir : relative })
      },
      fromRelative: (path: string) => {
        return nodePath.resolve(target.fileDir, path)
      },
      tsExtToJsExt: (path: string) => {
        return path.replace(/\.tsx?$/, ".js")
      },
    }
    const ctx: Gen0.RunnerCtx = {
      ...Gen0.ctx,
      ...specialFns,
      gen0: this,
      prints,
      filePath: target.filePath,
      fileDir: target.fileDir,
      storage,
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
    return [srcContent.substring(0, target.outputStartPos), output, srcContent.substring(target.outputEndPos)]
      .filter(Boolean)
      .join("\n")
  }

  // plugins

  async findPluginsPaths() {
    return await Gen0.findFilesPaths({ cwd: this.projectRootDir, glob: Gen0.pluginsGlob, relative: false })
  }

  static definePlugin(plugin: Gen0.Plugin): Gen0.Plugin {
    return plugin
  }

  async applyPlugin(plugin: Gen0.Plugin) {
    const pluginResult = typeof plugin === "function" ? plugin(this) : plugin
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

  // utils

  static async findFilesPaths({
    cwd,
    glob,
    relative,
  }: {
    cwd: string
    glob: string
    relative?: string | false
  }): Promise<string[]> {
    const paths = await globby(glob, { cwd, gitignore: true, absolute: true })
    if (!relative) {
      return paths
    } else {
      return paths.map((path) => nodePath.relative(relative, path))
    }
  }

  findFilesPaths({ glob, relative }: { glob: string; relative?: string | false }) {
    return Gen0.findFilesPaths({
      cwd: this.projectRootDir,
      glob,
      relative,
    })
  }

  static getConfigPath = ({ cwd }: { cwd: string }) => {
    return findUpSync([".gen0.mjs"], { cwd })
  }

  static getProjectRootDir = ({ configPath }: { configPath: string }) => {
    return nodePath.dirname(configPath)
  }

  static absPath = ({ projectRootDir, cwd, path }: { projectRootDir: string; cwd: string; path: string }) => {
    if (path.startsWith("@/")) {
      path = nodePath.join(projectRootDir, path.replace(/^@\//, ""))
    }
    return nodePath.resolve(cwd, path)
  }

  absPath({ cwd, path }: { cwd: string; path: string }) {
    return Gen0.absPath({ projectRootDir: this.projectRootDir, cwd, path: path })
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
    gen0: Gen0
    filePath: string
    fileDir: string
    fromRelative: (path: string) => string
    storage: RunnerStorage
  }
  export type RunnerStorage = Record<string, any>

  export type PluginGetter = (gen0: Gen0) => PluginResult
  export type PluginResult = {
    ctx?: Record<string, (ctx: RunnerCtx, ...args: any[]) => any | Promise<any>>
  }
  export type Plugin = PluginGetter | PluginResult
}
