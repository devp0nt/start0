import { createLoader } from "@shmoject/site/lib/reactRouter"
import { trpc } from "@shmoject/site/lib/trpc"
import { HomePage } from "@shmoject/site/pages/HomePage"
import { useLoaderData } from "react-router"
import type { Route } from "./+types/home"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IdeaNick" },
    { name: "description", content: "Change the world with your ideas" },
  ]
}

export const loader = createLoader(async ({ qc }) => {
  return await qc.fetchQuery(trpc.ping.queryOptions())
})

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function HomeRoute() {
  const { dehydratedState: _dehydratedState, ...dataFromLoader } =
    useLoaderData<typeof loader>()
  return <HomePage dataFromLoader={dataFromLoader} />
}
