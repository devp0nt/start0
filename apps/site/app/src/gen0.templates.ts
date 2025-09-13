export namespace RRGen0 {
  export const routeFileTemplate = ({
    pathForImport,
    selfBaseNameWitoutExt,
  }: {
    pathForImport: string
    selfBaseNameWitoutExt: string
  }) => {
    return `import page from "${pathForImport}"
import { Error0 } from "@devp0nt/error0"
import { SiteError } from "@site/core/components/Error"
import { RR0 } from "@site/core/lib/rr0"
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

  export const routesFileTemplate = ({ structure }: { structure: string }) => {
    return `import { index, layout, type RouteConfig, route } from "@react-router/dev/routes"

export default ${structure} satisfies RouteConfig
`
  }
}
