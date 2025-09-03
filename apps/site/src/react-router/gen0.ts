import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import type { Page0 } from "apps/site/src/lib/page0"

export default (async ({ fs, _ }) => {
  await fs.loadEnv(".env")

  const pagesGlob = ["~/**/*.page.si.ts{x,}", "~/apps/site/**/*.page.ts{x,}"]
  const appDir = fs.resolve(".")
  const generatedRoutesDir = fs.toAbs(fs.resolve(appDir, "routes/generated"))

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
      getRouteContent({
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
    const structure = buildRoutesStructure(input)
    const { routesFilePath } = getHelpersByPagePath(pagesPaths[0])
    await fs.writeFile(routesFilePath, getRoutesContent({ structure }))
    return pagesPaths
  }

  const clearGeneratedRoutesDir = async () => {
    await fs.node.rmdir(generatedRoutesDir, { recursive: true })
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
        watch: pagesGlob,
        handler: async (ctx, event, path) => {
          await generateEverything()
        },
      },
    },
  }
}) satisfies Gen0Plugin.Definition

const getRouteContent = ({
  pathForImport,
  selfBaseNameWitoutExt,
}: {
  pathForImport: string
  selfBaseNameWitoutExt: string
}) => {
  return `import page from "${pathForImport}"
import { Error0 } from "@ideanick/modules/lib/error0.sh"
import { SiteError } from "@ideanick/site/components/Error"
import { RR0 } from "@ideanick/site/lib/reactRouter0"
import type { Route } from "./+types/${selfBaseNameWitoutExt}"

export const meta = RR0.createMeta(({ loaderData, params, error }: RR0.MetaArgs<Route.MetaArgs>) => {
  if (!loaderData) {
    return [{ title: Error0.from(error).message }]
  }
  const result = page.meta({
    loaderData: loaderData.data,
    query: loaderData.query,
    params,
    ctx: loaderData.siteCtx,
  })
  return result
})

export const loader = RR0.createLoader(async ({ qc, params, query, ctx }: RR0.LoaderArgs<Route.LoaderArgs>) => {
  return await page.loader?.({ qc, params, query, ctx })
})

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <SiteError.Page error={error} />
}

const RouteComponent = RR0.createRouteComponent(
  ({ params, loaderData }: RR0.RouteComponentArgs<Route.ComponentProps>) => {
    return (
      <page.component params={params} query={loaderData.query} loaderData={loaderData.data} ctx={loaderData.siteCtx} />
    )
  },
)

export default RouteComponent
`
}

const getRoutesContent = ({ structure }: { structure: string }) => {
  return `
import { index, layout, type RouteConfig, route } from "@react-router/dev/routes"

export default ${structure} satisfies RouteConfig
`
}

type RRInput = {
  routePathRelativeToAppDir: string
  layouts: string[]
  route0Definition: string // "/" means index
}

type RRNode =
  | { type: "layout"; layoutPath: string; children: RRNode[] }
  | { type: "index"; componentPath: string }
  | { type: "route"; path: string; componentPath: string }

export function buildRoutesStructure(data: RRInput[]): string {
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
        path: item.route0Definition.replace(/^\//, ""), // drop leading slash
        componentPath: item.routePathRelativeToAppDir,
      })
    }
  }

  // optional: stable-ish ordering — layouts first, then index, then routes
  const sortNodes = (nodes: RRNode[]) => {
    const order = { layout: 0, index: 1, route: 2 } as const
    nodes.sort((a, b) => order[a.type] - order[b.type])
    for (const n of nodes) if (n.type === "layout") sortNodes(n.children)
  }
  sortNodes(root)

  // stringifier for the requested DSL
  const q = (s: string) => JSON.stringify(s)
  const indentUnit = "  "
  const printNodes = (nodes: RRNode[], indent = 0): string => {
    const pad = indentUnit.repeat(indent)
    const inner = nodes
      .map((n) => {
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
      .join(",\n")
    return `[\n${inner}\n${pad}]`
  }

  return printNodes(root, 0)
}
