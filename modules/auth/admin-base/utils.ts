import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from '@auth/backend/utils'
import { createClientAdminPlugin } from '../shared/permissions'
import { env } from '@admin/base/env.runtime'

export const authClient = createAuthClient({
  baseURL: env.VITE_BACKEND_URL,
  plugins: [await createClientAdminPlugin(), customSessionClient<typeof auth>()],
})
