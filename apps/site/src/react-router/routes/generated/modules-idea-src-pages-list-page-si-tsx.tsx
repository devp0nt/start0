import page from "../../../../../../modules/idea/src/pages/list.page.si.js"
import { Error0 } from "@/lib/error0.sh"
import { SiteError } from "@/site/components/Error"
import { RR0 } from "@/site/react-router/utils.js"
import type { Route } from "./+types/modules-idea-src-pages-list-page-si-tsx"

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
  