import type { auth } from '@auth/backend/utils'
import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { createClientAdminPlugin } from '../shared/permissions'
import { sharedEnv } from '@shared/base/env.runtime'

export const authClient = createAuthClient({
  // baseURL: env.VITE_BACKEND_URL, // TODO: use sharedEnv form updated Env0 package
  baseURL: sharedEnv.VITE_BACKEND_URL || sharedEnv.BACKEND_URL || sharedEnv.EXPO_PUBLIC_BACKEND_URL,
  plugins: [await createClientAdminPlugin(), customSessionClient<typeof auth>()],
})
