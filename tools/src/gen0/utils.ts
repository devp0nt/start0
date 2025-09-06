import nodePath from "node:path"
import { globby } from "globby"
import { globifyGitIgnoreFile } from "globify-gitignore"
import { Gen0Logger } from "@/tools/gen0/logger"

export namespace Gen0Utils {
  export const logger = Gen0Logger.create("utils")
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
