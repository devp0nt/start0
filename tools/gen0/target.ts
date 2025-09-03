import type { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"

// TODO: respect silent mark, using tests
export class Gen0Target {
  static logger = Gen0Logger.create("target")
  logger = Gen0Target.logger

  static inlineCommentStartMarks = ["//", "#"]
  static blockCommentStartMarks = ["/*"]
  static blockCommentEndMarks = ["*/"]
  static startMark = "@gen0:start"
  static endMark = "@gen0:end"
  static silentMark = "@gen0:silent"

  client: Gen0Client
  startLineIndex: number
  scriptContent: string
  outputStartLineIndex: number
  outputEndLineIndex: number
  outputContent: string | undefined

  private constructor({
    client,
    startLineIndex,
    scriptContent,
    outputContent,
    outputStartLineIndex,
    outputEndLineIndex,
  }: {
    client: Gen0Client
    startLineIndex: number
    scriptContent: string
    outputContent: string
    outputStartLineIndex: number
    outputEndLineIndex: number
  }) {
    this.client = client
    this.scriptContent = scriptContent
    this.startLineIndex = startLineIndex
    this.outputStartLineIndex = outputStartLineIndex
    this.outputEndLineIndex = outputEndLineIndex
    this.outputContent = outputContent
  }

  async getClientContentFilled({ outputContent, clientContent }: { outputContent: string; clientContent?: string }) {
    const srcContent = clientContent || (await this.client.file.read())
    const srcLines = srcContent.split("\n")
    if (outputContent.trim() === "") {
      srcLines.splice(this.outputStartLineIndex, this.outputEndLineIndex - this.outputStartLineIndex)
    } else {
      srcLines.splice(this.outputStartLineIndex, this.outputEndLineIndex - this.outputStartLineIndex, outputContent)
    }
    const newSrcContent = srcLines.join("\n")
    return newSrcContent
  }

  async fill({
    outputContent,
    clientContent,
    writeFile = false,
  }: {
    outputContent: string
    clientContent?: string
    writeFile?: boolean
  }) {
    const newClientContent = await this.getClientContentFilled({ outputContent, clientContent })
    if (writeFile) {
      await this.client.file.write(newClientContent)
    }
    this.outputContent = outputContent
    const targetUpdated = await Gen0Target.extract({
      client: this.client,
      clientContent: newClientContent,
      skipBeforeLineIndex: this.startLineIndex > 0 ? this.startLineIndex - 1 : 0,
    })
    if (targetUpdated) {
      if (targetUpdated.outputContent !== this.outputContent) {
        // biome-ignore lint/suspicious/noConsole: <x>
        console.error(`Target updated content differs from expectedcontent`, {
          expected: this.outputContent,
          received: targetUpdated.outputContent,
        })
      }
      this.scriptContent = targetUpdated.scriptContent
      this.startLineIndex = targetUpdated.startLineIndex
      this.outputStartLineIndex = targetUpdated.outputStartLineIndex
      this.outputEndLineIndex = targetUpdated.outputEndLineIndex
      this.outputContent = targetUpdated.outputContent
    } else {
      // biome-ignore lint/suspicious/noConsole: <x>
      console.error(`Target update not found in file ${this.client.file.path.abs} at line ${this.startLineIndex + 1}`)
    }
    return newClientContent
  }

  static async extract({
    client,
    clientContent,
    skipBeforeLineIndex = 0,
  }: {
    client: Gen0Client
    clientContent?: string
    skipBeforeLineIndex?: number
  }) {
    const startMark = Gen0Target.startMark
    const endMark = Gen0Target.endMark
    const inlineCommentStartMarks = Gen0Target.inlineCommentStartMarks
    const blockCommentStartMarks = Gen0Target.blockCommentStartMarks
    const blockCommentEndMarks = Gen0Target.blockCommentEndMarks

    const findLineIndex = (lines: string[], fn: (line: string) => boolean, skipBeforeLineIndex: number = 0) => {
      const cuttedLines = lines.slice(skipBeforeLineIndex)
      const lineIndex = cuttedLines.findIndex(fn)
      return lineIndex === -1 ? -1 : lineIndex + skipBeforeLineIndex
    }

    clientContent = clientContent || (await client.file.read())
    const srcLines = clientContent.split("\n")
    const startLineIndex = findLineIndex(srcLines, (line) => line.includes(startMark), skipBeforeLineIndex)
    if (startLineIndex === -1) {
      return null
    }
    const endLineIndex = findLineIndex(srcLines, (line) => line.includes(endMark), startLineIndex)
    if (endLineIndex === -1) {
      throw new Error(`Expecting "${endMark}" in file ${client.file.path.abs} in line ${startLineIndex + 1} or later`)
    }
    const nextStartLineIndex = findLineIndex(srcLines, (line) => line.includes(startMark), endLineIndex)

    if (nextStartLineIndex !== -1 && nextStartLineIndex < endLineIndex) {
      throw new Error(`Expecting "${endMark}" in file ${client.file.path.abs} before line ${nextStartLineIndex}`)
    }

    const startLine = srcLines[startLineIndex]
    const startLineContentTrimmedBeforeStartString = startLine.substring(0, startLine.indexOf(startMark)).trim()
    const commentType = (() => {
      if (inlineCommentStartMarks.some((mark) => startLineContentTrimmedBeforeStartString === mark)) {
        return "inline" as const
      }
      if (blockCommentStartMarks.some((mark) => startLineContentTrimmedBeforeStartString === mark)) {
        return "block" as const
      }
      return null
      // throw new Error(
      //   `Expecting "${inlineCommentStartMarks.join(" or ")}" or "${blockCommentStartMarks.join(" or ")}" in file ${client.file.path.abs} in line ${startLineIndex + 1} before "${startMark}" and nothing else`,
      // )
    })()
    if (!commentType) {
      return null
    }

    const outputEndLineIndex = endLineIndex
    const { scriptContent, outputStartLineIndex } = (() => {
      if (commentType === "inline") {
        const scriptStartPosInLine = startLine.indexOf(startMark) + startMark.length
        const scriptContent = startLine.substring(scriptStartPosInLine)
        const outputStartLineIndex = startLineIndex + 1
        return { scriptContent, outputStartLineIndex }
      } else {
        const skipBeforeIndex = srcLines.slice(0, startLineIndex).join("\n").length
        const scriptStartPosInFile = clientContent.indexOf(startMark, skipBeforeIndex) + startMark.length
        const blockCommentEndMarkPosInFile = (() => {
          for (const blockCommentEndMark of blockCommentEndMarks) {
            const blockCommentEndMarkPosInFile = clientContent.indexOf(blockCommentEndMark, scriptStartPosInFile)
            if (blockCommentEndMarkPosInFile !== -1) {
              return blockCommentEndMarkPosInFile
            }
          }
          throw new Error(
            `Expecting "${blockCommentEndMarks.join(" or ")}" in file ${client.file.path.abs} after "${startMark}" in line ${startLineIndex + 1}`,
          )
        })()
        const endPosInFile = clientContent.indexOf(endMark, skipBeforeIndex)
        if (blockCommentEndMarkPosInFile > endPosInFile) {
          throw new Error(
            `Expecting block comment end mark "${blockCommentEndMarks.join(" or ")}" in file ${client.file.path.abs} after "${startMark}" adter line ${startLineIndex} before "${endMark}"`,
          )
        }
        const scriptEndPosInFile = blockCommentEndMarkPosInFile
        const scriptContent = clientContent.substring(scriptStartPosInFile, scriptEndPosInFile)
        const outputStartLineIndex = clientContent.slice(0, blockCommentEndMarkPosInFile).split("\n").length + 1
        return { scriptContent, outputStartLineIndex }
      }
    })()
    const outputContent = srcLines.slice(outputStartLineIndex, outputEndLineIndex).join("\n")

    return new Gen0Target({
      startLineIndex,
      scriptContent,
      outputStartLineIndex,
      outputEndLineIndex,
      client,
      outputContent,
    })
  }
}

// async processFile({ path }: { path: string }) {
//   const srcContent = await fs.readFile(path, "utf8")
//   const distContent = await this.generateFileContent({ srcContent, path })
//   await fs.writeFile(path, distContent)
//   if (this.afterProcessCmd) {
//     const afterProcessCmd =
//       typeof this.afterProcessCmd === "function" ? this.afterProcessCmd(path) : this.afterProcessCmd
//     await exec(afterProcessCmd, { cwd: this.projectRootDir })
//   }
// }

// async generateFileContent({ srcContent, path }: { srcContent: string; path: string }) {
//   let distContent = srcContent
//   let target = Gen0.getTarget({ srcContent: distContent, skipBeforePos: 0, path })
//   const store: Gen0.RunnerStore = {}
//   while (target) {
//     const targetOutput = await this.generateTargetOutput({ target, store })
//     distContent = Gen0.injectTargetOutput({ target, output: targetOutput, srcContent: distContent })
//     target = Gen0.getTarget({ srcContent: distContent, skipBeforePos: target.outputEndPos, path })
//   }
//   return distContent
// }

// static getTarget({
//   srcContent,
//   skipBeforePos = 0,
//   path,
// }: {
//   srcContent: string
//   skipBeforePos?: number
//   path: string
// }): Gen0.Target | null {
//   const startString = "// @gen0:start "
//   const endString = "// @gen0:end"
//   const definitionStartPos = srcContent.indexOf(startString, skipBeforePos)
//   if (definitionStartPos === -1) {
//     return null
//   }
//   const definitionEndPos = srcContent.indexOf(endString, definitionStartPos)
//   if (definitionEndPos === -1) {
//     throw new Error(`gen0 target end not found, you forget to add "${endString}" in file "${path}"`)
//   }
//   const nextDefinitionStartPos = srcContent.indexOf(startString, definitionStartPos + 1)
//   if (nextDefinitionStartPos !== -1 && nextDefinitionStartPos < definitionEndPos) {
//     throw new Error(`gen0 target end not found, you forget to add "${endString}" in file "${path}"`)
//   }
//   // from "// gen0 " to end of line
//   const scriptStartPos = definitionStartPos + startString.length
//   const scriptEndPos = srcContent.indexOf("\n", scriptStartPos)
//   const scriptContent = srcContent.substring(scriptStartPos, scriptEndPos)
//   // next line after scriptEndPos
//   const scriptDefinitionEndPos = scriptEndPos
//   const outputStartPos = scriptDefinitionEndPos
//   const outputEndPos = definitionEndPos
//   return {
//     filePath: path,
//     fileDir: nodePath.dirname(path),
//     scriptContent,
//     outputStartPos,
//     outputEndPos,
//   }
// }

// static injectTargetOutput({
//   target,
//   output,
//   srcContent,
// }: {
//   target: Gen0.Target
//   output: string
//   srcContent: string
// }): string {
//   return (
//     srcContent.substring(0, target.outputStartPos) +
//     "\n\n" +
//     output +
//     "\n" +
//     srcContent.substring(target.outputEndPos)
//   )
// }
