import nodeFsSync from "node:fs"
import type { Fs0 } from "@devp0nt/fs0"
import type { Gen0ClientProcessCtx } from "@devp0nt/gen0/clientProcessCtx"
import type { Gen0Plugin } from "@devp0nt/gen0/plugin"

const getConstExportNames = (ctx: Gen0ClientProcessCtx, filePath: string) => {
  filePath = ctx.fs0.toAbs(filePath)
  const content = nodeFsSync.readFileSync(filePath, "utf8")
  // Match: export const <identifier>
  const regex = /export\s+const\s+([A-Za-z0-9_$]+)/g
  const matches: string[] = []
  let match: RegExpExecArray | null
  // biome-ignore lint/suspicious/noAssignInExpressions: <x>
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1])
  }
  return matches
}

export const importFromFiles = (
  ctx: Gen0ClientProcessCtx,
  glob: Fs0.PathOrPaths,
  printer: (path: Fs0.PathParsed) => string,
  replaceExt?: string | false,
  withEmptyLine: boolean = true,
  noWatcher: boolean = false,
) => {
  if (!noWatcher) {
    ctx.watch(glob)
  }
  const paths = ctx.fs0.findFilesPathsSync(glob)
  const result: { paths: string[] } = {
    paths: [],
  }
  for (let path of paths) {
    if (replaceExt) {
      path = ctx.fs0.replaceExt(path, replaceExt)
    }
    path = ctx.fs0.toRel(path, ctx.fs0.cwd)
    result.paths.push(path)
    ctx.print(printer(ctx.fs0.parsePath(path)))
  }
  if (withEmptyLine && ctx.prints.length > 0) {
    ctx.prints.unshift("")
  }
  ctx.$.paths = result.paths
  return result
}

export const importAsFromFiles = (
  ctx: Gen0ClientProcessCtx,
  glob: Fs0.PathOrPaths,
  as: (path: Fs0.PathParsed) => string,
  replaceExt?: string | false,
  withEmptyLine?: boolean,
  noWatcher: boolean = false,
) => {
  if (!noWatcher) {
    ctx.watch(glob)
  }
  const paths = ctx.fs0.findFilesPathsSync(glob)
  const result: { paths: string[]; names: string[] } = {
    paths: [],
    names: [],
  }
  for (let path of paths) {
    const pathParsed = ctx.fs0.parsePath(path)
    const asOutput = as(pathParsed)
    if (replaceExt) {
      path = ctx.fs0.replaceExt(path, replaceExt)
    }
    path = ctx.fs0.toRel(path, ctx.fs0.cwd)
    result.paths.push(path)
    result.names.push(asOutput)
    ctx.print(`import ${asOutput} from "${path}"`)
  }
  if (withEmptyLine && ctx.prints.length > 0) {
    ctx.prints.unshift("")
  }
  ctx.$.paths = result.paths
  ctx.$.names = result.names
  return result
}

export const importExportedFromFiles = (
  ctx: Gen0ClientProcessCtx,
  glob: Fs0.PathOrPaths,
  exportEndsWith?: string,
  replaceExt: string | false = ".js",
  withEmptyLine: boolean = true,
  noWatcher: boolean = false,
) => {
  if (!noWatcher) {
    ctx.watch(glob)
  }
  const paths = ctx.fs0.findFilesPathsSync(glob)
  const result: {
    files: Array<{ path: string; names: string[]; cutted: string[] }>
    paths: string[]
    names: string[]
    cutted: string[]
    imports: Array<{ path: string; name: string; cutted: string }>
  } = {
    files: [],
    paths: [],
    names: [],
    cutted: [],
    imports: [],
  }
  for (let path of paths) {
    let exportNames = getConstExportNames(ctx, path)
    if (exportEndsWith) {
      exportNames = exportNames.filter((exportName: string) => exportName.endsWith(exportEndsWith))
    }
    if (exportNames.length === 0) {
      continue
    }
    const exportNamesCutted = exportEndsWith
      ? exportNames.map((exportName: string) => exportName.slice(0, -exportEndsWith.length))
      : exportNames
    if (replaceExt) {
      path = ctx.fs0.replaceExt(path, replaceExt)
    }
    path = ctx.fs0.toRel(path, ctx.fs0.cwd)
    result.files.push({ path, names: exportNames, cutted: exportNamesCutted })
    result.names.push(...exportNames)
    result.cutted.push(...exportNamesCutted)
    result.paths.push(path)
    for (let i = 0; i < exportNames.length; i++) {
      result.imports.push({ path, name: exportNames[i], cutted: exportNamesCutted[i] })
    }
    ctx.print(`import { ${exportNames.join(", ")} } from "${path}"`)
  }
  if (withEmptyLine && ctx.prints.length > 0) {
    ctx.prints.unshift("")
  }
  ctx.$.files = result.files
  ctx.$.names = result.names
  ctx.$.cutted = result.cutted
  ctx.$.paths = result.paths
  ctx.$.imports = result.imports
  return result
}

export default {
  name: "importFromFiles",
  fns: {
    importFromFiles,
    importAsFromFiles,
    importExportedFromFiles,
  },
} satisfies Gen0Plugin.DefinitionResult
