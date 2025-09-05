import type { Page0 } from "apps/site/src/lib/page0"
import type { Gen0Plugin } from "@/tools/gen0/plugin"

export default (async ({ fs, _ }) => {
  await fs.loadEnv(".env")

  const { RRGen0 } = await fs.importFresh<typeof import("./gen0.templates")>("./gen0.templates.ts")
  const pagesGlob = ["~/**/*.page.si.ts{x,}", "~/apps/site/**/*.page.ts{x,}"]
  const watchGlob = [...pagesGlob, "./gen0.templates.ts"]
  const appDir = fs.resolve(".")
  const generatedRoutesDir = fs.toAbs(fs.resolve(appDir, "routes/generated"))
  const catchall = "./routes/catchall.tsx"

  const getHelpersByPagePath = (pagePath: string) => {
    const pagePathRelToProjectRoot = fs.toRel(pagePath, fs.rootDir)
    const pagePathSlug = _.kebabCase(pagePathRelToProjectRoot)
    const routeFilePath = fs.resolve(generatedRoutesDir, `${pagePathSlug}.tsx`)
    const pagePathRelToGeneratedRoutesDir = fs.replaceExt(fs.toRel(pagePath, generatedRoutesDir), ".js")
    const routePathRelativeToAppDir = fs.toRel(routeFilePath, appDir)
    const routesFilePath = fs.resolve(appDir, "routes.ts")
    return {
      pagePathRelToProjectRoot,
      pagePathSlug,
      routeFilePath,
      pagePathRelToGeneratedRoutesDir,
      routePathRelativeToAppDir,
      routesFilePath,
    }
  }

  const generateRouteFileByPagePath = async (pagePath: string) => {
    const { routeFilePath, pagePathSlug, pagePathRelToGeneratedRoutesDir } = getHelpersByPagePath(pagePath)
    await fs.writeFile(
      routeFilePath,
      RRGen0.routeFileTemplate({
        pathForImport: pagePathRelToGeneratedRoutesDir,
        selfBaseNameWitoutExt: pagePathSlug,
      }),
    )
  }

  const generateAllRoutesFiles = async (pagesPaths?: string[]) => {
    pagesPaths = pagesPaths || (await fs.findFilesPaths(pagesGlob))
    await Promise.all(pagesPaths.map(generateRouteFileByPagePath))
    return pagesPaths
  }

  const removeAllUnusedRoutesFiles = async (pagesPaths?: string[]) => {
    pagesPaths = pagesPaths || (await fs.findFilesPaths(pagesGlob))
    const unuedPaths: string[] = []
    const existsingRoutesPaths = await fs.findFilesPaths(generatedRoutesDir)
    const neeededRoutesPaths = pagesPaths.map((pagePath) => getHelpersByPagePath(pagePath).routeFilePath)
    for (const existingRoutePath of existsingRoutesPaths) {
      if (!neeededRoutesPaths.includes(existingRoutePath)) {
        unuedPaths.push(existingRoutePath)
      }
    }
    await Promise.all(unuedPaths.map((p) => fs.rm(p)))
    return pagesPaths
  }

  const generateRoutesFile = async (pagesPaths?: string[]) => {
    pagesPaths = pagesPaths || (await fs.findFilesPaths(pagesGlob))
    const input: RRInput[] = await Promise.all(
      pagesPaths.map((pagePath) =>
        fs.importFreshDefault<Page0<any, any>>(pagePath).then(async (page) => {
          const { routePathRelativeToAppDir } = getHelpersByPagePath(pagePath)
          const layouts = page.layouts
          const route0Definition = page.route.getDefinition()
          return { routePathRelativeToAppDir, layouts, route0Definition }
        }),
      ),
    )
    const structure = buildRoutesStructure(input, catchall)
    const { routesFilePath } = getHelpersByPagePath(pagesPaths[0])
    await fs.writeFile(routesFilePath, RRGen0.routesFileTemplate({ structure }))
    return pagesPaths
  }

  const clearGeneratedRoutesDir = async () => {
    await fs.rmdir(generatedRoutesDir)
  }

  const generateEverything = async () => {
    await clearGeneratedRoutesDir()
    const pagesPaths = await generateAllRoutesFiles()
    await generateRoutesFile(pagesPaths)
  }

  return {
    name: "reactRouter",
    init: async () => {
      await generateEverything()
    },
    watchers: {
      createRouteByPage: {
        watch: watchGlob,
        handler: async (ctx, event, path) => {
          if (event !== "delete") {
            await generateRouteFileByPagePath(path)
          }
          const pagesPaths = await generateRoutesFile()
          await removeAllUnusedRoutesFiles(pagesPaths)
        },
      },
    },
  }
}) satisfies Gen0Plugin.Definition

type RRInput = {
  routePathRelativeToAppDir: string
  layouts: string[] // 0..3 layout paths
  route0Definition: string // "/" => index, else route path (can include params)
}

type RRNode =
  | { type: "layout"; layoutPath: string; children: RRNode[] }
  | { type: "index"; componentPath: string }
  | { type: "route"; path: string; componentPath: string }

// --- core builder that returns only the array DSL as a string ---
function buildRoutesStructure(data: RRInput[], catchallPath: string): string {
  const root: RRNode[] = []

  const findOrCreateLayout = (level: RRNode[], layoutPath: string): RRNode => {
    let node = level.find((n) => n.type === "layout" && (n as any).layoutPath === layoutPath) as RRNode | undefined
    if (!node) {
      node = { type: "layout", layoutPath, children: [] }
      level.push(node)
    }
    return node
  }

  for (const item of data) {
    let level = root
    for (const layoutPath of item.layouts || []) {
      const layoutNode = findOrCreateLayout(level, layoutPath) as Extract<RRNode, { type: "layout" }>
      level = layoutNode.children
    }

    if (item.route0Definition === "/") {
      level.push({ type: "index", componentPath: item.routePathRelativeToAppDir })
    } else {
      level.push({
        type: "route",
        path: item.route0Definition.replace(/^\//, ""),
        componentPath: item.routePathRelativeToAppDir,
      })
    }
  }

  // Make ordering stable: layouts first, then index, then routes
  const sortNodes = (nodes: RRNode[]) => {
    const order = { layout: 0, index: 1, route: 2 } as const
    nodes.sort((a, b) => order[a.type] - order[b.type])
    for (const n of nodes) if (n.type === "layout") sortNodes(n.children)
  }
  sortNodes(root)

  // Stringify to DSL, appending a generated catchall as the last entry of each array
  const q = (s: string) => JSON.stringify(s)
  const indentUnit = "  "
  let catchallCounter = 0

  const makeCatchallLine = (pad: string) =>
    `${pad}${indentUnit}route("*", ${q(catchallPath)}, { id: ${q(`catchall${++catchallCounter}`)} })`

  const printNodes = (nodes: RRNode[], indent = 0): string => {
    const pad = indentUnit.repeat(indent)
    const lines: string[] = nodes.map((n) => {
      if (n.type === "index") {
        return `${pad}${indentUnit}index(${q(n.componentPath)})`
      }
      if (n.type === "route") {
        return `${pad}${indentUnit}route(${q(n.path)}, ${q(n.componentPath)})`
      }
      // layout
      const children = printNodes(n.children, indent + 1)
      return `${pad}${indentUnit}layout(${q(n.layoutPath)}, ${children})`
    })

    // Always append the catchall as the final element of this array
    lines.push(makeCatchallLine(pad))

    return `[\n${lines.join(",\n")}\n${pad}]`
  }

  return printNodes(root, 0)
}
