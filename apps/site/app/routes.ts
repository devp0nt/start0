import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/GeneralLayout.tsx", [
    index("routes/home.tsx"),
    route("ideas", "routes/ideas.tsx"),
    route("ideas/:id", "routes/idea.tsx"),
  ]),
] satisfies RouteConfig;

export const siteRoutes = {
  x: 1,
};
