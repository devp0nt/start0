import type { Gen0Fs } from "@ideanick/tools/gen0/fs"

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
}
