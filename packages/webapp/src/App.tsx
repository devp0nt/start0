import { AdminAccountPage } from '@/general/src/admin/pages/AdminAccountPage/index.js'
import { AdminActionLogListPage } from '@/general/src/actionLog/pages/AdminActionLogListPage/index.js'
import { AdminAdminEditPage } from '@/general/src/admin/pages/AdminAdminEditPage/index.js'
import { AdminAdminListPage } from '@/general/src/admin/pages/AdminAdminListPage/index.js'
import { AdminAdminNewPage } from '@/general/src/admin/pages/AdminAdminNewPage/index.js'
import { AdminSignInPage } from '@/general/src/auth/pages/AdminSignInPage/index.js'
import { AdminSignOutPage } from '@/general/src/auth/pages/AdminSignOutPage/index.js'
import { UserResetPasswordPage } from '@/general/src/auth/pages/UserResetPasswordPage/index.js'
import { UserRestorePasswordPage } from '@/general/src/auth/pages/UserRestorePasswordPage/index.js'
import { UserSignInPage } from '@/general/src/auth/pages/UserSignInPage/index.js'
import { UserSignOutPage } from '@/general/src/auth/pages/UserSignOutPage/index.js'
import { UserProjectListPage } from '@/general/src/project/pages/UserProjectListPage/index.js'
import { UserProjectNewPage } from '@/general/src/project/pages/UserProjectNewPage/index.js'
import { UserProjectViewPage } from '@/general/src/project/pages/UserProjectViewPage/index.js'
import { AdminUserEditPage } from '@/general/src/user/pages/AdminUserEditPage/index.js'
import { AdminUserListPage } from '@/general/src/user/pages/AdminUserListPage/index.js'
import { AdminUserNewPage } from '@/general/src/user/pages/AdminUserNewPage/index.js'
import { UserAccountPage } from '@/general/src/user/pages/UserAccountPage/index.js'
import { NotFoundPageComponent } from '@/webapp/src/components/errors/NotFoundPageComponent/index.js'
import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { AnchorClickListener } from '@/webapp/src/lib/anchor.js'
import { AppContextPreloader } from '@/webapp/src/lib/ctx.js'
import * as routes from '@/webapp/src/lib/routes.js'
import '@/webapp/src/lib/sentry.js'
import { Toaster } from '@/webapp/src/lib/toaster.js'
import { TrpcProvider } from '@/webapp/src/lib/trpc.js'
import { ProgressLine } from '@/webapp/src/lib/uninty.components.js'
import { WindowSizeWatcher } from '@/webapp/src/lib/windowSize.js'
import { PolicyPage } from '@/webapp/src/pages/docs/PolicyPage/index.js'
import { TermsPage } from '@/webapp/src/pages/docs/TermsPage/index.js'
import { HomePage } from '@/webapp/src/pages/other/HomePage/index.js'
import '@/webapp/src/styles/global.scss'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export const App = () => {
  return (
    <HelmetProvider>
      <TrpcProvider>
        <AppContextPreloader>
          <BrowserRouter>
            <AnchorClickListener />
            <ProgressLine />
            <WindowSizeWatcher />
            <Toaster />
            <Routes>
              <Route path={routes.homeRoute.definition} element={<HomePage />} />
              <Route path={routes.termsRoute.definition} element={<TermsPage />} />
              <Route path={routes.policyRoute.definition} element={<PolicyPage />} />

              <Route path={routes.userSignInRoute.definition} element={<UserSignInPage />} />
              <Route path={routes.userRestorePasswordRoute.definition} element={<UserRestorePasswordPage />} />
              <Route path={routes.userResetPasswordRoute.definition} element={<UserResetPasswordPage />} />
              <Route path={routes.userSignOutRoute.definition} element={<UserSignOutPage />} />

              <Route path={routes.userAccountRoute.definition} element={<UserAccountPage />} />

              <Route path={routes.adminSignOutRoute.definition} element={<AdminSignOutPage />} />
              <Route path={routes.adminSignInRoute.definition} element={<AdminSignInPage />} />

              <Route path={routes.adminAccountRoute.definition} element={<AdminAccountPage />} />
              <Route path={routes.adminActionLogsRoute.definition} element={<AdminActionLogListPage />} />

              <Route path={routes.adminAdminListRoute.definition} element={<AdminAdminListPage />} />
              <Route path={routes.adminAdminNewRoute.definition} element={<AdminAdminNewPage />} />
              <Route path={routes.adminAdminEditRoute.definition} element={<AdminAdminEditPage />} />

              <Route path={routes.adminUserListRoute.definition} element={<AdminUserListPage />} />
              <Route path={routes.adminUserNewRoute.definition} element={<AdminUserNewPage />} />
              <Route path={routes.adminUserEditRoute.definition} element={<AdminUserEditPage />} />

              <Route path={routes.adminAdminListRoute.definition} element={<AdminAdminListPage />} />
              <Route path={routes.adminAdminNewRoute.definition} element={<AdminAdminNewPage />} />
              <Route path={routes.adminAdminEditRoute.definition} element={<AdminAdminEditPage />} />

              <Route path={routes.userProjectListRoute.definition} element={<UserProjectListPage />} />
              <Route path={routes.userProjectNewRoute.definition} element={<UserProjectNewPage />} />
              <Route path={routes.userProjectViewRoute.definition} element={<UserProjectViewPage />} />

              <Route
                path="*"
                element={
                  <GeneralLayout>
                    <NotFoundPageComponent />
                  </GeneralLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </AppContextPreloader>
      </TrpcProvider>
    </HelmetProvider>
  )
}
