import { Refine } from '@refinedev/core'

import { useNotificationProvider } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'

import { axiosInstance } from '@admin/core/lib/axios'
import { refineAuthProvider } from '@auth/admin/admin/refine'
import { backendAdminRoutesBasePath } from '@backend/shared/utils'
import { Refine0 } from '@devp0nt/refine0/client'
import routerProvider from '@refinedev/react-router'

export const refine0 = Refine0.create({
  openapiUrl: `${import.meta.env.VITE_BACKEND_URL}${backendAdminRoutesBasePath}/doc.json`,
  apiUrl: import.meta.env.VITE_BACKEND_URL,
  httpClient: axiosInstance,
})

export const RefineSetup = ({ children }: { children: React.ReactNode }) => {
  const refineResources = refine0.useRefineResources()
  return (
    <Refine
      dataProvider={{
        default: refine0.dataProvider,
      }}
      notificationProvider={useNotificationProvider}
      routerProvider={routerProvider}
      authProvider={refineAuthProvider}
      resources={[...refineResources]}
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
          // console.log('resource', resource)
          // console.log('action', action)
          // console.log('params', params)

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
