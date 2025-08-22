import { ErrorPage } from "@shmoject/site/components/Error"
import {
  createLoader,
  type LoaderArgs0,
  useLoaderData0,
} from "@shmoject/site/lib/reactRouter"
import { trpc } from "@shmoject/site/lib/trpc"
import { IdeaPage } from "@shmoject/site/pages/IdeaPage"
import type { Route } from "./+types/idea"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Idea" }, { name: "description", content: "Idea" }]
}

export const loader = createLoader(
  async ({ qc, params }: LoaderArgs0<Route.LoaderArgs>) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaId: params.id }))
  },
)

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function IdeasRoute({}: Route.ComponentProps) {
  const loaderData = useLoaderData0<typeof loader>()
  if (loaderData.error0) {
    return <ErrorPage error={loaderData.error0} />
  } else {
    return <IdeaPage idea={loaderData.data.idea} />
  }
}
