import { IdeaPage as Page } from "@shmoject/modules/ideas/pages/IdeaPage"
import { SiteError } from "@shmoject/site/components/Error"
import { createLoader0, type LoaderArgs0 } from "@shmoject/site/lib/reactRouter"
import type { Route } from "./+types/idea"

export function meta({ loaderData, params }: Route.MetaArgs) {
  if (loaderData) {
    return Page.meta({ loaderData: loaderData.data, params })
  }
}

export const loader = createLoader0(
  async ({ qc, params }: LoaderArgs0<Route.LoaderArgs>) => {
    return await Page.loader({ qc, params })
  },
)

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <SiteError.Page error={error} />
}

export default function RouteComponent({
  params,
  loaderData,
}: Route.ComponentProps) {
  return <Page.Component params={params} loaderData={loaderData.data} />
}
