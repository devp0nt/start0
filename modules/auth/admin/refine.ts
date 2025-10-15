import { authClient } from '@auth/client-base'
import { getFinalPermissions, hasPermission } from '@auth/shared/permissions'
import type { AccessControlProvider, AuthProvider, LoginFormTypes } from '@refinedev/core'
import { useGetIdentity as useGetIdentityOriginal } from '@refinedev/core'
import camelCase from 'lodash/camelCase'
import type { UseQueryResult } from '@tanstack/react-query'

export const refineAuthProvider = {
  login: async ({ remember, email, password, redirectPath }: LoginFormTypes) => {
    if (!email || !password) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: 'Invalid email or password',
        },
      }
    }
    const { error } = await authClient.signIn.email(
      {
        email,
        password,
        //A URL to redirect to after the user verifies their email (optional)
        callbackURL: redirectPath || '/',
        rememberMe: remember,
      },
      {
        //callbacks
      },
    )
    if (error) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: error.message || 'Unknown auth error',
        },
      }
    }
    return {
      success: true,
      redirectTo: redirectPath || '/',
    }
  },
  logout: async () => {
    await authClient.signOut()
    return {
      success: true,
      redirectTo: '/login',
    }
  },
  check: async () => {
    const { data } = await authClient.getSession()
    if (data?.admin) {
      return {
        authenticated: true,
      }
    }
    return {
      logout: true,
      authenticated: false,
      redirectTo: '/login',
      error: {
        name: 'Unauthorized',
        message: 'Not authorized',
      },
    }
  },
  getPermissions: async (params) => {
    // TODO: figure out what is it
    return null
  },
  getIdentity: async () => {
    const { data, error } = await authClient.getSession()
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
    if (data?.admin) {
      return {
        id: data.admin.id,
        name: data.admin.name,
        avatar: data.admin.image,
        role: data.admin.role,
        permissions: getFinalPermissions(data.admin.role, data.admin.specialPermissions),
        email: data.admin.email,
      }
    }
    return null
  },
  onError: async (error) => {
    return { error }
  },
} satisfies AuthProvider

export type RefineIdentity = Awaited<ReturnType<typeof refineAuthProvider.getIdentity>>

export const useRefineGetIdentity = (): UseQueryResult<RefineIdentity> => {
  return useGetIdentityOriginal()
}

export const refineAccessControlProvider = {
  can: async ({ resource, action, params }) => {
    if (!resource || !action) {
      return { can: true }
    }
    const resourceName = camelCase(resource)
    const session = await authClient.getSession()
    if (session.error) {
      return { can: false, reason: session.error.message || 'Unknown error' }
    }
    const { admin } = session.data
    if (!admin) {
      return { can: false, reason: 'Only for admins' }
    }
    const permissionAction = ['show', 'list', 'get'].includes(action) ? 'view' : 'manage'
    const can = hasPermission({
      role: admin.role,
      specialPermissions: admin.specialPermissions,
      permission: {
        [resourceName]: [permissionAction],
      },
    })
    if (!can) {
      return { can: false, reason: `Only for admins with "${permissionAction}" permission for "${resourceName}"` }
    }
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
} satisfies AccessControlProvider
