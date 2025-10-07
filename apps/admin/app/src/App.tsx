import '@ant-design/v5-patch-for-react-19'
import { Authenticated } from '@refinedev/core'
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar'

import { ErrorComponent, ThemedLayout, ThemedSider, ThemedTitle } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'

import { SiderAfter, SiderBefore } from '@admin/app/components/sider'
import { refine0, RefineSetup } from '@admin/app/lib/refine'
import { Loader } from '@admin/core/components/loader'
import { AdminCtx } from '@admin/core/lib/ctx'
import { ResourceListPage } from '@admin/core/pages/list'
import { TrpcProvider } from '@admin/core/lib/trpc'
import { appName } from '@apps/shared/utils'
import { ForgotPasswordPage } from '@auth/admin/admin/pages/forgotPassword'
import { LoginPage } from '@auth/admin/admin/pages/login'
import {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router'
import { Alert, App as AntdApp } from 'antd'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { Header } from './components/header'
import { ColorModeContextProvider } from './lib/colorMode'
import { ResourceCreatePage } from '@admin/core/pages/create'
import { ResourceEditPage } from '@admin/core/pages/edit'
import { ResourceShowPage } from '@admin/core/pages/show'

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <RefineSetup>
              <TrpcProvider>
                <AdminCtx.Provider>
                  <refine0.Provider
                    Error={({ message }) => <Alert type="error" message={message} />}
                    Loader={<Loader type="site" />}
                  >
                    <Routes>
                      <Route
                        element={
                          <Authenticated key="authenticated-inner" fallback={<CatchAllNavigate to="/login" />}>
                            <ThemedLayout
                              Header={Header}
                              Sider={(props) => (
                                <ThemedSider
                                  {...props}
                                  Title={({ collapsed }) => {
                                    return <ThemedTitle collapsed={collapsed} text={appName} />
                                  }}
                                  render={({ items, logout, collapsed }) => {
                                    return (
                                      <>
                                        <SiderBefore />
                                        {items}
                                        {logout}
                                        <SiderAfter />
                                      </>
                                    )
                                  }}
                                  fixed
                                />
                              )}
                            >
                              <Outlet />
                            </ThemedLayout>
                          </Authenticated>
                        }
                      >
                        <Route index element={<NavigateToResource resource="blog_posts" />} />
                        <Route path="/:resource">
                          <Route index element={<ResourceListPage />} />
                          <Route path="create" element={<ResourceCreatePage />} />
                          <Route path="edit/:id" element={<ResourceEditPage />} />
                          <Route path="show/:id" element={<ResourceShowPage />} />
                        </Route>
                        <Route path="*" element={<ErrorComponent />} />
                      </Route>
                      <Route
                        element={
                          <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                            <NavigateToResource />
                          </Authenticated>
                        }
                      >
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      </Route>
                    </Routes>

                    <RefineKbar />
                    <UnsavedChangesNotifier />
                    <DocumentTitleHandler />
                  </refine0.Provider>
                </AdminCtx.Provider>
              </TrpcProvider>
            </RefineSetup>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  )
}

export default App
