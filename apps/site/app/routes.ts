import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes"

export default [
  layout("components/GeneralLayout.tsx", [
    index("routes/home.tsx"),
    route("ideas", "routes/ideas.tsx"),
    route("ideas/:sn", "routes/idea.tsx"),
  ]),
] satisfies RouteConfig

export const siteRoutes = {
  x: 1,
}
