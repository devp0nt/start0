import { Refine } from '@refinedev/core'

import { useNotificationProvider } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'

import { backendDataProvider } from '@admin/app/dataProvider'
import { AdminCtx } from '@admin/core/lib/ctx'
import { useRefineResources } from '@admin/core/lib/schema'
import { refineAuthProvider } from '@auth/admin/admin/refine'
import { backendAdminRoutesBasePath } from '@backend/shared/utils'
import routerProvider from '@refinedev/react-router'

export const RefineSetup = ({ children }: { children: React.ReactNode }) => {
  const env = AdminCtx.useEnv()
  const refineResources = useRefineResources({
    routePrefix: backendAdminRoutesBasePath,
    projectSlugs: Object.keys(projects),
    projectSlug: lastActiveNonGeneralProjectSlug,
  })
  return (
    <Refine
      dataProvider={{
        default: backendDataProvider(`${env.VITE_BACKEND_URL}${backendAdminRoutesBasePath}`),
      }}
      notificationProvider={useNotificationProvider}
      routerProvider={routerProvider}
      authProvider={refineAuthProvider}
      resources={[
        {
          name: 'blog_posts',
          list: '/blog-posts',
          create: '/blog-posts/create',
          edit: '/blog-posts/edit/:id',
          show: '/blog-posts/show/:id',
          meta: {
            canDelete: true,
            dataProviderName: 'fakeRest',
          },
        },
        {
          name: 'categories',
          list: '/categories',
          create: '/categories/create',
          edit: '/categories/edit/:id',
          show: '/categories/show/:id',
          clone: '/categories/clone/:id',
          meta: {
            canDelete: true,
            dataProviderName: 'fakeRest',
          },
        },
        ...refineResources,
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
      accessControlProvider={{
        can: async ({ resource, action, params }) => {
          // if (resource === 'posts' && action === 'edit') {
          //   return {
          //     can: false,
          //     reason: 'Unauthorized',
          //   }
          // }
          console.log('resource', resource)
          console.log('action', action)
          console.log('params', params)

          return { can: true }
        },
        options: {
          buttons: {
            enableAccessControl: true,
            hideIfUnauthorized: true,
          },
          queryOptions: {
            // ... default global query options
          },
        },
      }}
    >
      {children}
    </Refine>
  )
}
