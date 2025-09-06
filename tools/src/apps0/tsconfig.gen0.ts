import nodeFsSync from "node:fs"
import { Fs0 } from "@/tools/fs0"
import type { Gen0ClientProcessCtx } from "@/tools/gen0/clientProcessCtx"
import type { Gen0Fs } from "@/tools/gen0/fs"
import type { Gen0Plugin } from "@/tools/gen0/plugin"

const appTsconfigIncludes = (ctx: Gen0ClientProcessCtx, appName: string) => {
  const config = ctx.fs.readJsonSync<typeof import("./config.json")>("./config.json")
  const appRecord = config.packages[appName as keyof typeof config.packages]
  if (!appRecord) {
    throw new Error(`App "${appName}" not found in apps0 config`)
  }
  const appAlias = appRecord.alias
  ctx.print(`// appName: ${appName}\n`)
}

const appTsconfigExcludes = (ctx: Gen0ClientProcessCtx, appName: string) => {
  const config = ctx.fs.readJsonSync<typeof import("./config.json")>("./config.json")
  const appRecord = config.packages[appName as keyof typeof config.packages]
  if (!appRecord) {
    throw new Error(`App "${appName}" not found in apps0 config`)
  }
  const appAlias = appRecord.alias
  ctx.print(`// appName: ${appName}\n`)
}

const appTsconfigPaths = (ctx: Gen0ClientProcessCtx) => {
  const config = ctx.fs.readJsonSync<typeof import("./config.json")>("./config.json")
  const modulesGlob = config.modulesGlob
  const modulesPaths = ctx.fs.glob(modulesGlob, {})
  const modulesPathsMap = modulesPaths.map((path) => {
    return {
      [path]: [path],
    }
  })
}

export default {
  name: "apps0Tsconfig",
  fns: {
    appTsconfigIncludes,
    appTsconfigExcludes,
  },
} satisfies Gen0Plugin.DefinitionResult
