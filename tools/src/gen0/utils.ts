import nodePath from "node:path"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import { globby } from "globby"
import { globifyGitIgnoreFile } from "globify-gitignore"

export namespace Gen0Utils {
  export const logger = Gen0Logger.create("utils")
  export type Search = string | string[] | RegExp | RegExp[]
  export const isStringMatch = (line: string | undefined, search: Search): boolean => {
    if (!line) return false
    if (Array.isArray(search)) {
      return search.some((item) => Gen0Utils.isStringMatch(line, item))
    } else if (typeof search === "string") {
      return line.includes(search)
    } else {
      return search.test(line)
    }
  }

  export const toArray = <T>(value: T | T[]): T[] => {
    return Array.isArray(value) ? value : [value]
  }
  export const getGitignoreGlob = async (cwd: string, reverse: boolean = false): Promise<string[]> => {
    const gitignoreFilesPaths = await globby("**/.gitignore", {
      cwd,
      gitignore: true,
      absolute: true,
      dot: true,
    })
    const promises = await Promise.all(
      gitignoreFilesPaths.map(async (pathAbs) => {
        const results = await globifyGitIgnoreFile(nodePath.dirname(pathAbs), true)
        return results.map((r) => (reverse ? (r.included ? r.glob : `!${r.glob}`) : r.included ? `!${r.glob}` : r.glob))
      }),
    )
    // biome-ignore lint/complexity/noFlatMapIdentity: <x>
    const globs = promises.flatMap((g) => g)
    return globs
  }
}
