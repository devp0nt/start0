import { axiosInstance } from '@admin/core/lib/axios'
import { env } from '@admin/base/lib/env.runtime'
import { queryClient } from '@trpc/frontend-base'
import { LoadingOutlined } from '@ant-design/icons'
import { refineAccessControlProvider, refineAuthProvider } from '@auth/admin/refine'
import { backendAdminRoutesBasePath } from '@backend/shared/utils'
import { createRefine0 } from '@devp0nt/refine0/client'
import { Icon } from '@iconify/react'
import { useNotificationProvider } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'
import { Refine } from '@refinedev/core'
import routerProvider from '@refinedev/react-router'

export const refine0 = createRefine0({
  openapiDocUrl: `${env.VITE_BACKEND_URL}${backendAdminRoutesBasePath}.json`,
  apiUrl: env.VITE_BACKEND_URL,
  httpClient: axiosInstance,
  Icon: ({ icon }) => <Icon icon={icon} fallback={<LoadingOutlined />} className="anticon ant-menu-item-icon" />,
})

export const RefineSetup = ({ children }: { children: React.ReactNode }) => {
  const refineResources = refine0.useResources()
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
        reactQuery: {
          clientConfig: queryClient,
        },
      }}
      accessControlProvider={refineAccessControlProvider}
    >
      {children}
    </Refine>
  )
}
