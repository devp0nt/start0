import { getIdea } from "@shmoject/site/lib/ideas"
import { IdeaPage } from "@shmoject/site/pages/IdeaPage"
import type { Route } from "./+types/idea"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Idea" }, { name: "description", content: "Idea" }]
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return {
    idea: await getIdea(+params.id),
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function IdeasRoute({
  loaderData: { idea },
}: Route.ComponentProps) {
  return <IdeaPage idea={idea} />
}
