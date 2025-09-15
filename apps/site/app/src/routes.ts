import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  layout('./components/GeneralLayout.tsx', [
    index('./routes/generated/apps-site-app-src-pages-home-page-tsx.tsx'),
    route('ideas/:sn', './routes/generated/modules-idea-site-src-view-page-tsx.tsx'),
    route('ideas', './routes/generated/modules-idea-site-src-list-page-tsx.tsx'),
    route('*', './routes/catchall.tsx', { id: 'catchall1' }),
  ]),
  route('*', './routes/catchall.tsx', { id: 'catchall2' }),
] satisfies RouteConfig
