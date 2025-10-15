import { SiderAfter, SiderBefore } from '@admin/base/components/sider'
import { refine0, RefineSetup } from '@admin/core/lib/refine'
import { Loader } from '@admin/base/components/loader'
import { CtxProvider } from '@admin/ctx'
import { TrpcProvider } from '@trpc/frontend-base'
import { ResourceCreatePage } from '@admin/core/pages/create'
import { ResourceEditPage } from '@admin/core/pages/edit'
import { ResourceListPage } from '@admin/core/pages/list'
import { ResourceShowPage } from '@admin/core/pages/show'
import '@ant-design/v5-patch-for-react-19'
import { projectName } from '@shared/base/general'
import { ForgotPasswordPage } from '@auth/admin/pages/forgotPassword'
import { LoginPage } from '@auth/admin/pages/login'
import { ProfilePage } from '@auth/admin/pages/profile'
import { ErrorComponent, ThemedLayout, ThemedSider, ThemedTitle } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'
import { Authenticated } from '@refinedev/core'
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar'
import {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router'
import { Alert, App as AntdApp } from 'antd'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { Header } from '@admin/core/components/header'
import { ColorModeContextProvider } from '@admin/base/components/colorMode'

// Global styles
const globalStyles = `
  .ant-menu-item .ant-menu-item-icon {
    min-width: 16px !important;
    font-size: 16px !important;
  }
`

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
            <RefineSetup>
              <TrpcProvider>
                <CtxProvider>
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
                                    return <ThemedTitle collapsed={collapsed} text={projectName} />
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
                        <Route path="/profile" element={<ProfilePage />} />
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
                </CtxProvider>
              </TrpcProvider>
            </RefineSetup>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  )
}

export default App
