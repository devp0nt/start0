import { getOneSharedEnv } from '@/general/src/other/sharedEnv.js'
import { createRoutyThings } from 'svag-routy'

const { createRoute } = createRoutyThings({
  baseUrl: getOneSharedEnv('WEBAPP_URL'),
  definitionParamsPrefix: ':',
})

// General

export const testRoute = createRoute(`/test`)

export const homeRoute = createRoute(`/`)
export const docsRoute = homeRoute.createRoute(`/docs`)

export const userRoute = homeRoute.createRoute(`/app`)
export const adminRoute = homeRoute.createRoute(`/admin`)

// Docs

export const policyRoute = docsRoute.createRoute(`/policy`)
export const termsRoute = docsRoute.createRoute(`/terms`)

// Auth

export const userAuthRoute = userRoute.createRoute(`/auth`)
export const userSignInRoute = userAuthRoute.createRoute(`/sign-in`)
export const userSignUpRoute = userAuthRoute.createRoute(`/sign-up`)
export const userSignOutRoute = userAuthRoute.createRoute(`/sign-out`)
export const userRestorePasswordRoute = userAuthRoute.createRoute(`/restore-password`)
export const userResetPasswordRoute = userAuthRoute.createRoute(`/reset-password`)

export const adminAuthRoute = adminRoute.createRoute(`/auth`)
export const adminSignInRoute = adminAuthRoute.createRoute(`/sign-in`)
export const adminSignUpRoute = adminAuthRoute.createRoute(`/sign-up`)
export const adminSignOutRoute = adminAuthRoute.createRoute(`/sign-out`)
export const adminRestorePasswordRoute = adminAuthRoute.createRoute(`/restore-password`)
export const adminResetPasswordRoute = adminAuthRoute.createRoute(`/reset-password`)

// User

// export const userDashboardRoute = userRoute.createRoute(`/dashboard`)
export const userSettingsRoute = userRoute.createRoute(`/settings`)
export const userAccountRoute = userRoute.createRoute(`/account`)
export const userSubscriptionRoute = userRoute.createRoute(`/subscription`)

const userProjectRoute = userRoute.createRoute(`/project`)
export const userProjectListRoute = userProjectRoute.createRoute(`/list`)
export const userProjectNewRoute = userProjectRoute.createRoute(`/new`)
export const userProjectViewRoute = userProjectRoute.createRoute({
  params: ['projectSn'],
  getter: ({ projectSn }) => `/view/${projectSn}`,
})
export const userDashboardRoute = userProjectListRoute

// Admin

// export const adminDashboardRoute = adminRoute.createRoute(`/dashboard`)
export const adminAccountRoute = adminRoute.createRoute(`/account`)
export const adminSettingsRoute = adminRoute.createRoute(`/settings`)
export const adminActionLogsRoute = adminRoute.createRoute(`/action-logs`)

const adminProjectsRoute = adminRoute.createRoute(`/project`)
export const adminProjectsListRoute = adminProjectsRoute.createRoute(`/list`)
export const adminProjectsNewRoute = adminProjectsRoute.createRoute(`/new`)
export const adminProjectsViewRoute = adminProjectsRoute.createRoute({
  params: ['projectSn'],
  getter: ({ projectSn }) => `/view/${projectSn}`,
})

const adminUserRoute = adminRoute.createRoute(`/user`)
export const adminUserListRoute = adminUserRoute.createRoute(`/list`)
export const adminUserViewRoute = adminUserRoute.createRoute({
  params: ['userSn'],
  getter: ({ userSn }) => `/view/${userSn}`,
})
export const adminUserEditRoute = adminUserRoute.createRoute({
  params: ['userSn'],
  getter: ({ userSn }) => `/edit/${userSn}`,
})
export const adminUserNewRoute = adminUserRoute.createRoute(`/new`)
export const adminDashboardRoute = adminUserListRoute

const adminAdminRoute = adminRoute.createRoute(`/admin`)
export const adminAdminListRoute = adminAdminRoute.createRoute(`/list`)
export const adminAdminViewRoute = adminAdminRoute.createRoute({
  params: ['adminSn'],
  getter: ({ adminSn }) => `/view/${adminSn}`,
})
export const adminAdminEditRoute = adminAdminRoute.createRoute({
  params: ['adminSn'],
  getter: ({ adminSn }) => `/edit/${adminSn}`,
})
export const adminAdminNewRoute = adminAdminRoute.createRoute(`/new`)

// specific

type WithSnOrNull = { sn: number } | null
export const getRoute = ({
  viewerType,
  abs,
  user,
  project,
  admin,
}: {
  viewerType: 'user' | 'admin'
  abs?: boolean
  user?: WithSnOrNull
  project?: WithSnOrNull
  admin?: WithSnOrNull
}) => {
  if (viewerType === 'admin') {
    if (user) {
      return adminUserEditRoute.get({ userSn: user.sn, abs })
    }
    if (admin) {
      return adminAdminEditRoute.get({ adminSn: admin.sn, abs })
    }
    if (project) {
      return adminProjectsViewRoute.get({ projectSn: project.sn, abs })
    }
  }
  if (viewerType === 'user') {
    if (project) {
      return userProjectViewRoute.get({ projectSn: project.sn, abs })
    }
  }
  return undefined
}
