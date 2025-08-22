import { createLoader } from "@shmoject/site/lib/reactRouter"
import { trpc } from "@shmoject/site/lib/trpc"
import { IdeaPage } from "@shmoject/site/pages/IdeaPage"
import type { Route } from "./+types/idea"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Idea" }, { name: "description", content: "Idea" }]
}

export const loader = createLoader(async ({ qc, params }) => {
  return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaId: params.id }))
})

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function IdeasRoute({
  loaderData: { idea },
}: Route.ComponentProps) {
  return <IdeaPage idea={idea} />
}
