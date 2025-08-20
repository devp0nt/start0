import { HomePage } from "@shmoject/site/pages/home";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IdeaNick" },
    { name: "description", content: "Change the world with your ideas" },
  ];
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute() {
  return <HomePage />;
}
