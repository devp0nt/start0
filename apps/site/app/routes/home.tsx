import { Error0 } from "@shmoject/modules/lib/error0.sh"
import { SiteError } from "@shmoject/site/components/Error"
import { RR0 } from "@shmoject/site/lib/reactRouter0"
import { HomePage as Page } from "@shmoject/site/pages/HomePage"
import type { Route } from "./+types/home"

export const meta = RR0.createMeta(
  ({ loaderData, params, error }: RR0.MetaArgs<Route.MetaArgs>) => {
    if (!loaderData) {
      return [{ title: Error0.from(error).message }]
    }
    const result = Page.meta?.({
      loaderData: loaderData.data,
      search: loaderData.search,
      params,
      ctx: loaderData.siteCtx,
    })
    return result
  },
)

export const loader = RR0.createLoader(
  async ({ qc, params, search, ctx }: RR0.LoaderArgs<Route.LoaderArgs>) => {
    return await Page.loader?.({ qc, params, search, ctx })
  },
)

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <SiteError.Page error={error} />
}

const RouteComponent = RR0.createRouteComponent(
  ({ params, loaderData }: RR0.RouteComponentArgs<Route.ComponentProps>) => {
    return (
      <Page.Component
        params={params}
        search={loaderData.search}
        loaderData={loaderData.data}
        ctx={loaderData.siteCtx}
      />
    )
  },
)

export default RouteComponent
