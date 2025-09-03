// import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
// import gitignoreToGlob from "gitignore-to-glob"
// import { globby } from "globby"
// import nodePath from "path"

export namespace Gen0Utils {
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
  // export const getGitignoreGlob = async (cwd: string): Promise<string[]> => {
  //   const gitignoreFilesPaths = await globby(cwd, {
  //     gitignore: true,
  //     absolute: true,
  //     dot: true,
  //   })
  //   const relativeToCwd = (path: string) => {
  //     const selfRelative = nodePath.resolve(nodePath.dirname(cwd), path)
  //     const cwdRelative = nodePath.relative(cwd, selfRelative)
  //     return cwdRelative
  //   }
  //   const gitignoreGlobs = gitignoreFilesPaths.flatMap((path) => {
  //     const glob: string[] = gitignoreToGlob(path)
  //     return glob.map(relativeToCwd)
  //   })
  //   return gitignoreGlobs
  // }
}
