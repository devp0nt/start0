import type { Gen0ClientProcessCtx } from "@/tools/gen0/clientProcessCtx"
import type { Gen0Plugin } from "@/tools/gen0/plugin"

const appTsconfigIncludes = (ctx: Gen0ClientProcessCtx, appName: string) => {
  const config = ctx.fs0.readJsonSync<typeof import("./config.json")>("./config.json")
  const appRecord = config.packages[appName as keyof typeof config.packages]
  if (!appRecord) {
    throw new Error(`App "${appName}" not found in apps0 config`)
  }
  const appAlias = appRecord.alias
  ctx.print(`// appName: ${appName}\n`)
}

const appTsconfigExcludes = (ctx: Gen0ClientProcessCtx, appName: string) => {
  const config = ctx.fs0.readJsonSync<typeof import("./config.json")>("./config.json")
  const appRecord = config.packages[appName as keyof typeof config.packages]
  if (!appRecord) {
    throw new Error(`App "${appName}" not found in apps0 config`)
  }
  const appAlias = appRecord.alias
  ctx.print(`// appName: ${appName}\n`)
}

const appTsconfigPaths = (ctx: Gen0ClientProcessCtx) => {
  const config = ctx.fs0.readJsonSync<typeof import("./config.json")>("./config.json")
  const modulesGlob = config.modulesGlob
  const modulesPaths = ctx.fs0.globSync(modulesGlob, { onlyDirectories: true, relative: true })
  const tsconfigPaths: [string, string][] = []
  for (const modulePath of modulesPaths) {
    const moduleName = ctx.fs0.parsePath(modulePath).dirname
    const srcPath = ctx.fs0.resolve(moduleName, "src")
    const absModulePath = (() => {
      if (ctx.fs0.isExistsSync(srcPath)) {
        return srcPath
      }
      return modulePath
    })()
    const relModulePath = ctx.rootFs0.toRel(absModulePath)
    const tsconfigPathLeft = `@/${moduleName}/*`
    const tsconfigPathRight = `${relModulePath}/*`
    tsconfigPaths.push([tsconfigPathLeft, tsconfigPathRight])
  }
  for (const [left, right] of tsconfigPaths) {
    ctx.print(`"${left}": [${right}],`)
  }
}

export default {
  name: "apps0Tsconfig",
  fns: {
    appTsconfigIncludes,
    appTsconfigExcludes,
    appTsconfigPaths,
  },
} satisfies Gen0Plugin.DefinitionResult
