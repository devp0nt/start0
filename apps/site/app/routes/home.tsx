import { createLoader, type LoaderArgs0 } from "@shmoject/site/lib/reactRouter"
import { trpc } from "@shmoject/site/lib/trpc"
import { HomePage } from "@shmoject/site/pages/HomePage"
import type { Route } from "./+types/home"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IdeaNick" },
    { name: "description", content: "Change the world with your ideas" },
  ]
}

export const loader = createLoader(
  async ({ qc, params }: LoaderArgs0<Route.LoaderArgs>) => {
    return await qc.fetchQuery(trpc.ping.queryOptions())
  },
)

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage dataFromLoader={loaderData} />
}
