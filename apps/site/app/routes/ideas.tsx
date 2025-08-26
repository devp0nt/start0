import { IdeasPage as Page } from "@shmoject/modules/ideas/pages/IdeasPage"
import { SiteError } from "@shmoject/site/components/Error"
import { RR0 } from "@shmoject/site/lib/reactRouter"
import type { Route } from "./+types/ideas"

export function meta({ loaderData, params }: Route.MetaArgs) {
  if (!loaderData) {
    return undefined
  }
  return Page.meta({
    loaderData: loaderData.data,
    params,
    ctx: loaderData.siteCtx,
  })
}

export const loader = RR0.createLoader(
  async ({ qc, params, ctx }: RR0.LoaderArgs<Route.LoaderArgs>) => {
    return await Page.loader({ qc, params, ctx })
  },
)

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <SiteError.Page error={error} />
}

export default function RouteComponent({
  params,
  loaderData,
}: Route.ComponentProps) {
  return (
    <Page.Component
      params={params}
      loaderData={loaderData.data}
      ctx={loaderData.siteCtx}
    />
  )
}
