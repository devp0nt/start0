import { createReactQueryHonoClient } from '@admin/core/lib/hono2'
import type { HonoAdmin, HonoApp } from '@backend/hono-router'
import { backendHonoAdminRoutesBasePath, backendHonoAppRoutesBasePath } from '@backend/shared/utils'
import { hc } from 'hono/client'

export const honoAdminClient = hc<HonoAdmin>(`${import.meta.env.VITE_BACKEND_URL}${backendHonoAdminRoutesBasePath}`)
export const honoAppClient = hc<HonoApp>(`${import.meta.env.VITE_BACKEND_URL}${backendHonoAppRoutesBasePath}`)

// export const honoAdminClient2 = addReactQueryToHonoClient(
//   hc<HonoAdmin>(`${import.meta.env.VITE_BACKEND_URL}${backendHonoAdminRoutesBasePath}`),
// )
// export const honoAppClient2 = addReactQueryToHonoClient(
//   hc<HonoApp>(`${import.meta.env.VITE_BACKEND_URL}${backendHonoAppRoutesBasePath}`),
// )
export const honoAdminClient2 = createReactQueryHonoClient<HonoAdmin>(
  `${import.meta.env.VITE_BACKEND_URL}${backendHonoAdminRoutesBasePath}`,
)
export const honoAppClient2 = createReactQueryHonoClient<HonoApp>(
  `${import.meta.env.VITE_BACKEND_URL}${backendHonoAppRoutesBasePath}`,
)
