import { createReactQueryHonoClient } from '@admin/core/lib/hono.rq'
import type { HonoAdmin, HonoApp } from '@backend/hono-router'
import { backendHonoAdminRoutesBasePath, backendHonoAppRoutesBasePath } from '@backend/shared/utils'

export const honoAdminClient = createReactQueryHonoClient<HonoAdmin>(
  `${import.meta.env.VITE_BACKEND_URL}${backendHonoAdminRoutesBasePath}`,
)
export const honoAppClient = createReactQueryHonoClient<HonoApp>(
  `${import.meta.env.VITE_BACKEND_URL}${backendHonoAppRoutesBasePath}`,
)
