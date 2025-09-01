import fs from "node:fs/promises"
import nodePath from "node:path"
import vm from "node:vm"
import { findUpSync } from "find-up"

// TODO: many config extensions
// TODO: watchers

export class Gen0 {
  static ctx: Record<string, any> = {}
  static watchers: Record<string, (ctx: Gen0.TargetCtx) => void | Promise<void>> = {}

  configPath: string
  projectRootDir: string

  constructor({ cwd }: { cwd: string }) {
    const configPath = Gen0.getConfigPath({ cwd })
    if (!configPath) {
      throw new Error("gen0 config file not found")
    }
    this.configPath = configPath
    this.projectRootDir = Gen0.getProjectRootDir({ configPath })
  }

  async generateFileContent({ srcContent, path }: { srcContent: string; path: string }) {
    let distContent = srcContent
    let target = Gen0.getTarget({ srcContent: distContent, skipBeforePos: 0, path })
    while (target) {
      const targetOutput = await this.generateTargetOutput({ target })
      distContent = Gen0.injectTargetOutput({ target, output: targetOutput, srcContent: distContent })
      target = Gen0.getTarget({ srcContent: distContent, skipBeforePos: target.outputEndPos, path })
    }
    return distContent
  }

  async processFile({ path }: { path: string }) {
    const srcContent = await fs.readFile(path, "utf8")
    const distContent = await this.generateFileContent({ srcContent, path })
    await fs.writeFile(path, distContent)
  }

  getTargetCtx({ target }: { target: Gen0.Target }) {
    const prints: string[] = []
    const ctx: Gen0.TargetCtx = {
      ...Gen0.ctx,
      prints,
      print: (print: string) => {
        prints.push(print)
      },
      filePath: target.filePath,
      fileDir: target.fileDir,
    }
    return ctx
  }

  async generateTargetOutput({ target }: { target: Gen0.Target }) {
    const targetCtx = this.getTargetCtx({ target })
    const vmContex = vm.createContext(targetCtx)
    await vm.runInContext(target.scriptContent, vmContex)
    const distContent = targetCtx.prints.join("\n")
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
    const startString = "// gen0 "
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

  static addToCtx(propKey: string, fn: (ctx: Gen0.TargetCtx) => any): void
  static addToCtx(propKey: string, something: any): void {
    Gen0.ctx[propKey] = something
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

  normalizePath({ cwd, path }: { cwd: string; path: string }) {
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
  export type TargetCtx = Record<string, any> & {
    prints: string[]
    print: (print: string) => void
    filePath: string
    fileDir: string
  }
}
