import { ideasPage as Page } from "@shmoject/modules/idea/pages/list.page.si"
import { Error0 } from "@shmoject/modules/lib/error0.sh"
import { SiteError } from "@shmoject/site/components/Error"
import { RR0 } from "@shmoject/site/lib/reactRouter0"
import type { Route } from "./+types/ideas"

export const meta = RR0.createMeta(
  ({ loaderData, params, error }: RR0.MetaArgs<Route.MetaArgs>) => {
    if (!loaderData) {
      return [{ title: Error0.from(error).message }]
    }
    const result = Page.meta?.({
      loaderData: loaderData.data,
      params,
      ctx: loaderData.siteCtx,
    })
    return result
  },
)

export const loader = RR0.createLoader(
  async ({ qc, params, ctx }: RR0.LoaderArgs<Route.LoaderArgs>) => {
    return await Page.loader?.({ qc, params, ctx })
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
        loaderData={loaderData.data}
        ctx={loaderData.siteCtx}
      />
    )
  },
)

export default RouteComponent
