import { env } from '@admin/base/env.runtime'
import type { HonoAdmin, HonoApp } from '@backend/hono-router'
import { backendHonoAdminRoutesBasePath, backendHonoAppRoutesBasePath } from '@backend/shared/utils'
import { createReactQueryHonoClient } from '@devp0nt/react-query-hono-client'

export const honoAdminClient = createReactQueryHonoClient<HonoAdmin>(
  `${env.VITE_BACKEND_URL}${backendHonoAdminRoutesBasePath}`,
)
export const honoAppClient = createReactQueryHonoClient<HonoApp>(
  `${env.VITE_BACKEND_URL}${backendHonoAppRoutesBasePath}`,
)
