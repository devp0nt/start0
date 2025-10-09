import { Refine } from '@refinedev/core'

import { useNotificationProvider } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'

import { axiosInstance } from '@admin/core/lib/axios'
import { refineAccessControlProvider, refineAuthProvider } from '@auth/admin/refine'
import { backendAdminRoutesBasePath } from '@backend/shared/utils'
import { Refine0 } from '@devp0nt/refine0/client'
import routerProvider from '@refinedev/react-router'
import { Icon } from '@iconify/react'
import { LoadingOutlined } from '@ant-design/icons'
import { env } from '@admin/core/lib/env.runtime'

export const refine0 = Refine0.create({
  openapiUrl: `${env.VITE_BACKEND_URL}${backendAdminRoutesBasePath}/doc.json`,
  apiUrl: env.VITE_BACKEND_URL,
  httpClient: axiosInstance,
  Icon: ({ icon }) => <Icon icon={icon} fallback={<LoadingOutlined />} className="anticon ant-menu-item-icon" />,
})

export const RefineSetup = ({ children }: { children: React.ReactNode }) => {
  const refineResources = refine0.useRefineResources()
  // TODO:ASAP refine identifiers
  // console.log('refineResources', refineResources)
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
      accessControlProvider={refineAccessControlProvider}
    >
      {children}
    </Refine>
  )
}
