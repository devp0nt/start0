/* eslint-disable no-console */
import { authClient } from '@auth/admin/admin/client'
import type { AuthProvider, LoginFormTypes } from '@refinedev/core'

export const TOKEN_KEY = 'refine-auth'

export const refineAuthProvider: AuthProvider = {
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
        /**
         * A URL to redirect to after the user verifies their email (optional)
         */
        callbackURL: redirectPath || '/',
        /**
         * remember the user session after the browser is closed.
         * @default true
         */
        rememberMe: remember,
      },
      {
        //callbacks
      },
    )
    if (error) {
      console.error(error)
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
    // localStorage.removeItem(TOKEN_KEY)
    await authClient.signOut()
    return {
      success: true,
      redirectTo: '/login',
    }
  },
  check: async () => {
    const { data, error } = await authClient.getSession()
    if (error) {
      console.error(error)
    }

    if (data?.user) {
      return {
        authenticated: true,
      }
    }

    return {
      authenticated: false,
      redirectTo: '/login',
    }
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const { data, error } = await authClient.getSession()
    if (error) {
      console.error(error)
    }

    if (data?.user) {
      return {
        id: data.user.id,
        name: data.user.name,
        avatar: data.user.image,
      }
    }
    return null
  },
  onError: async (error) => {
    console.error(error)
    return { error }
  },
}
