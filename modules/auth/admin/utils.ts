import { getAdminPluginSettings } from '../shared/permissions'
import type { auth } from '../backend/utils'
import { adminClient, customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  plugins: [adminClient({ ...getAdminPluginSettings().options }), customSessionClient<typeof auth>()],
})
