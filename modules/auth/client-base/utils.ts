import type { auth } from '@auth/backend/utils'
import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { createClientAdminPlugin } from '../shared/permissions'

export const authClient = createAuthClient({
  // baseURL: env.VITE_BACKEND_URL, // TODO: use sharedEnv form updated Env0 package
  baseURL:
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
    process.env.BACKEND_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL,
  plugins: [await createClientAdminPlugin(), customSessionClient<typeof auth>()],
})
