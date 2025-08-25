import { ErrorPage } from "@shmoject/site/components/Error"
import { createLoader0, type LoaderArgs0 } from "@shmoject/site/lib/reactRouter"
import { HomePage as Page } from "@shmoject/site/pages/HomePage"
import type { Route } from "./+types/home"

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
  return <ErrorPage error={error} />
}

export default function RouteComponent({
  params,
  loaderData,
}: Route.ComponentProps) {
  return <Page.Component params={params} loaderData={loaderData.data} />
}
