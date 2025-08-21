import { getIdeas } from "@shmoject/site/lib/ideas";
import { IdeasPage } from "@shmoject/site/pages/IdeasPage";
import type { Route } from "./+types/ideas";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Ideas" }, { name: "description", content: "All ideas" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return {
    ideas: await getIdeas(),
  };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function IdeasRoute({
  loaderData: { ideas },
}: Route.ComponentProps) {
  return <IdeasPage ideas={ideas} />;
}
