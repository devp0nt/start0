import { getQueryClient, trpc } from "@shmoject/site/lib/trpc"
import { HomePage } from "@shmoject/site/pages/HomePage"
import { dehydrate } from "@tanstack/react-query"
import { useLoaderData } from "react-router"
import type { Route } from "./+types/home"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IdeaNick" },
    { name: "description", content: "Change the world with your ideas" },
  ]
}

export async function loader(loaderArgs: Route.LoaderArgs) {
  const queryClient = getQueryClient()
  const data = await queryClient.fetchQuery(trpc.ping.queryOptions())
  const dehydratedState = dehydrate(queryClient)
  return {
    data,
    dehydratedState,
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>
}

export default function HomeRoute() {
  const { data: dataFromLoader } = useLoaderData<typeof loader>()
  return <HomePage dataFromLoader={dataFromLoader} />
}
