import { adminPluginOptions } from '@auth/admin/shared/utils'
import type { auth } from '@auth/backend/backend/utils'
import { adminClient, customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  plugins: [
    adminClient({
      ...adminPluginOptions,
    }),
    customSessionClient<typeof auth>(),
  ],
})
