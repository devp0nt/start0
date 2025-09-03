import { index, layout, type RouteConfig, route } from "@react-router/dev/routes"

export default [
  layout("../components/GeneralLayout.tsx", [
    index("./routes/generated/apps-site-src-pages-home-page-tsx.tsx"),
    route("ideas/:sn", "./routes/generated/modules-idea-pages-view-page-si-tsx.tsx"),
    route("ideas", "./routes/generated/modules-idea-pages-list-page-si-tsx.tsx"),
  ]),
] satisfies RouteConfig
