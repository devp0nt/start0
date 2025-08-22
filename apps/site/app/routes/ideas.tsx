import { ErrorPage } from "@shmoject/site/components/Error"
import { createLoader, type LoaderArgs0 } from "@shmoject/site/lib/reactRouter"
import { trpc } from "@shmoject/site/lib/trpc"
import { IdeasPage } from "@shmoject/site/pages/IdeasPage"
import type { Route } from "./+types/ideas"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ideas" }, { name: "description", content: "All ideas" }]
}

export const loader = createLoader(
  async ({ qc }: LoaderArgs0<Route.LoaderArgs>) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  },
)

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function IdeasRoute({ loaderData }: Route.ComponentProps) {
  if (loaderData.error0) {
    return <ErrorPage error={loaderData.error0} />
  } else {
    return <IdeasPage ideas={loaderData.data.ideas} />
  }
}
