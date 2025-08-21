import { HomePage } from "@shmoject/site/pages/HomePage";
import type { Route } from "./+types/home";
import { useTRPC } from "@shmoject/site/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { getQueryClientCache, trpc } from "@shmoject/site/lib/trpc";
import { useLoaderData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IdeaNick" },
    { name: "description", content: "Change the world with your ideas" },
  ];
}

export async function loader(loaderArgs: Route.LoaderArgs) {
  const queryClient = getQueryClientCache();
  const data = await queryClient.fetchQuery(trpc.ping.queryOptions());
  return {
    data,
  };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute() {
  const { data: datax } = useLoaderData<typeof loader>();
  const trpc = useTRPC();
  const { data } = useQuery(trpc.ping.queryOptions());
  return <HomePage data={{ data, datax }} />;
}
