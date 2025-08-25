import { IdeaPage } from "@shmoject/modules/ideas/pages/IdeaPage"
import { ErrorPage } from "@shmoject/site/components/Error"
import {
  createLoader0,
  type LoaderArgs0,
  useClearLoaderData0,
} from "@shmoject/site/lib/reactRouter"
import { trpc } from "@shmoject/site/lib/trpc"
import type { Route } from "./+types/idea"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Idea" }, { name: "description", content: "Idea" }]
}

export const loader = createLoader0(
  async ({ qc, params }: LoaderArgs0<Route.LoaderArgs>) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaId: params.id }))
  },
)

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function RouteComponent({}: Route.ComponentProps) {
  const loaderData = useClearLoaderData0<typeof loader>()
  if (loaderData.error0) {
    return <ErrorPage error={loaderData.error0} />
  } else {
    return <IdeaPage idea={loaderData.data.idea} />
  }
}
