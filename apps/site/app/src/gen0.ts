import type { Gen0Plugin } from '@devp0nt/gen0'
import type { Page0 } from '@site/core/lib/page0'

export default (async ({ fs0, _ }) => {
  await fs0.loadEnv('.env')

  const { RRGen0 } = await fs0.import<typeof import('./gen0.templates')>('./gen0.templates.ts', { moduleCache: false })
  const pagesGlob = ['~/**/*.page.ts{x,}']
  const watchGlob = [...pagesGlob, './gen0.templates.ts']
  const appDir = fs0.resolve('.')
  const generatedRoutesDir = fs0.toAbs(fs0.resolve(appDir, 'routes/generated'))
  const catchall = './routes/catchall.tsx'

  const getHelpersByPagePath = (pagePath: string) => {
    const pagePathRelToProjectRoot = fs0.toRel(pagePath, fs0.rootDir)
    const pagePathSlug = _.kebabCase(pagePathRelToProjectRoot)
    const routeFilePath = fs0.resolve(generatedRoutesDir, `${pagePathSlug}.tsx`)
    const pagePathRelToGeneratedRoutesDir = fs0.replaceExt(fs0.toRel(pagePath, generatedRoutesDir), '.js')
    const routePathRelativeToAppDir = fs0.toRel(routeFilePath, appDir)
    const routesFilePath = fs0.resolve(appDir, 'routes.ts')
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
    await fs0.writeFile(
      routeFilePath,
      RRGen0.routeFileTemplate({
        pathForImport: pagePathRelToGeneratedRoutesDir,
        selfBaseNameWitoutExt: pagePathSlug,
      }),
    )
  }

  const generateAllRoutesFiles = async (pagesPaths?: string[]) => {
    // biome-ignore lint/nursery/noUnnecessaryConditions: <biome bug>
    pagesPaths = pagesPaths || (await fs0.glob(pagesGlob))
    await Promise.all(pagesPaths.map(generateRouteFileByPagePath))
    return pagesPaths
  }

  const removeAllUnusedRoutesFiles = async (pagesPaths?: string[]) => {
    // biome-ignore lint/nursery/noUnnecessaryConditions: <biome bug>
    pagesPaths = pagesPaths || (await fs0.glob(pagesGlob))
    const unuedPaths: string[] = []
    const existsingRoutesPaths = await fs0.glob(generatedRoutesDir)
    const neeededRoutesPaths = pagesPaths.map((pagePath) => getHelpersByPagePath(pagePath).routeFilePath)
    for (const existingRoutePath of existsingRoutesPaths) {
      if (!neeededRoutesPaths.includes(existingRoutePath)) {
        unuedPaths.push(existingRoutePath)
      }
    }
    await Promise.all(unuedPaths.map((p) => fs0.rm(p)))
    return pagesPaths
  }

  const generateRoutesFile = async (pagesPaths?: string[]) => {
    // biome-ignore lint/nursery/noUnnecessaryConditions: <biome bug>
    pagesPaths = pagesPaths || (await fs0.glob(pagesGlob))
    const input: RRInput[] = await Promise.all(
      pagesPaths.map((pagePath) =>
        fs0
          // .importFreshDefault1<Page0<any, any>>(pagePath, { "@site/core/*": "../../apps/site/core/*" })
          .import<{ default: Page0<any, any> }>(pagePath, { default: true })
          .then(async ({ default: page }) => {
            const { routePathRelativeToAppDir } = getHelpersByPagePath(pagePath)
            const layouts = page.layouts
            const route0Definition = page.route.getDefinition()
            return { routePathRelativeToAppDir, layouts, route0Definition }
          }),
      ),
    )
    const structure = buildRoutesStructure(input, catchall)
    const { routesFilePath } = getHelpersByPagePath(pagesPaths[0])
    await fs0.writeFile(routesFilePath, RRGen0.routesFileTemplate({ structure }))
    return pagesPaths
  }

  const clearGeneratedRoutesDir = async () => {
    await fs0.rmdir(generatedRoutesDir)
  }

  const generateEverything = async () => {
    await clearGeneratedRoutesDir()
    const pagesPaths = await generateAllRoutesFiles()
    await generateRoutesFile(pagesPaths)
  }

  return {
    name: 'reactRouter',
    init: async () => {
      await generateEverything()
    },
    watchers: {
      createRouteByPage: {
        watch: watchGlob,
        handler: async (ctx, event, path) => {
          if (event !== 'delete') {
            await generateRouteFileByPagePath(path)
          }
          const pagesPaths = await generateRoutesFile()
          await removeAllUnusedRoutesFiles(pagesPaths)
        },
      },
    },
  }
}) as Gen0Plugin.Definition

type RRInput = {
  routePathRelativeToAppDir: string
  layouts: string[] // 0..3 layout paths
  route0Definition: string // "/" => index, else route path (can include params)
}

type RRNode =
  | { type: 'layout'; layoutPath: string; children: RRNode[] }
  | { type: 'index'; componentPath: string }
  | { type: 'route'; path: string; componentPath: string }

// --- core builder that returns only the array DSL as a string ---
function buildRoutesStructure(data: RRInput[], catchallPath: string): string {
  const root: RRNode[] = []

  const findOrCreateLayout = (level: RRNode[], layoutPath: string): RRNode => {
    let node = level.find((n) => n.type === 'layout' && (n as any).layoutPath === layoutPath) as RRNode | undefined
    if (!node) {
      node = { type: 'layout', layoutPath, children: [] }
      level.push(node)
    }
    return node
  }

  for (const item of data) {
    let level = root
    for (const layoutPath of item.layouts || []) {
      const layoutNode = findOrCreateLayout(level, layoutPath) as Extract<RRNode, { type: 'layout' }>
      level = layoutNode.children
    }

    if (item.route0Definition === '/') {
      level.push({ type: 'index', componentPath: item.routePathRelativeToAppDir })
    } else {
      level.push({
        type: 'route',
        path: item.route0Definition.replace(/^\//, ''),
        componentPath: item.routePathRelativeToAppDir,
      })
    }
  }

  // Make ordering stable: layouts first, then index, then routes
  const sortNodes = (nodes: RRNode[]) => {
    const order = { layout: 0, index: 1, route: 2 } as const
    nodes.sort((a, b) => order[a.type] - order[b.type])
    for (const n of nodes) if (n.type === 'layout') sortNodes(n.children)
  }
  sortNodes(root)

  // Stringify to DSL, appending a generated catchall as the last entry of each array
  const q = (s: string) => JSON.stringify(s)
  const indentUnit = '  '
  let catchallCounter = 0

  const makeCatchallLine = (pad: string) =>
    `${pad}${indentUnit}route("*", ${q(catchallPath)}, { id: ${q(`catchall${++catchallCounter}`)} })`

  const printNodes = (nodes: RRNode[], indent = 0): string => {
    const pad = indentUnit.repeat(indent)
    const lines: string[] = nodes.map((n) => {
      if (n.type === 'index') {
        return `${pad}${indentUnit}index(${q(n.componentPath)})`
      }
      if (n.type === 'route') {
        return `${pad}${indentUnit}route(${q(n.path)}, ${q(n.componentPath)})`
      }
      // layout
      const children = printNodes(n.children, indent + 1)
      return `${pad}${indentUnit}layout(${q(n.layoutPath)}, ${children})`
    })

    // Always append the catchall as the final element of this array
    lines.push(makeCatchallLine(pad))

    return `[\n${lines.join(',\n')}\n${pad}]`
  }

  return printNodes(root, 0)
}
