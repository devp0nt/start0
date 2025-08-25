import { IdeasPage } from "@shmoject/modules/ideas/pages/IdeasPage"
import { ErrorPage } from "@shmoject/site/components/Error"
import { createLoader0, type LoaderArgs0 } from "@shmoject/site/lib/reactRouter"
import { trpc } from "@shmoject/site/lib/trpc"
import type { Route } from "./+types/ideas"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ideas" }, { name: "description", content: "All ideas" }]
}

export const loader = createLoader0(
  async ({ qc }: LoaderArgs0<Route.LoaderArgs>) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  },
)

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  if (loaderData.error0) {
    return <ErrorPage error={loaderData.error0} />
  } else {
    return <IdeasPage ideas={loaderData.data.ideas} />
  }
}
