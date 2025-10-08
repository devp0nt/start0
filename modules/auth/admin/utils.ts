import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from '../backend/utils'
import { createClientAdminPlugin } from '../shared/permissions'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  plugins: [await createClientAdminPlugin(), customSessionClient<typeof auth>()],
})
