import { SiteError } from "@shmoject/site/components/Error"
import { ReactRouter0 } from "@shmoject/site/lib/reactRouter"
import { HomePage as Page } from "@shmoject/site/pages/HomePage"
import type { Route } from "./+types/home"

export function meta({ loaderData, params }: Route.MetaArgs) {
  if (!loaderData) {
    return undefined
  }
  return Page.meta({
    loaderData: loaderData.data,
    params,
    ctx: loaderData.ctx,
  })
}

export const loader = ReactRouter0.createLoader(
  async ({ qc, params, ctx }: ReactRouter0.LoaderArgs<Route.LoaderArgs>) => {
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
      ctx={loaderData.ctx}
    />
  )
}
