import type { HonoAdmin, HonoApp } from '@backend/hono-router'
import { backendAdminRoutesBasePath, backendAppRoutesBasePath } from '@backend/shared/utils'
import { hc } from 'hono/client'

export const honoAdminClient = hc<HonoAdmin>(`${import.meta.env.VITE_BACKEND_URL}${backendAdminRoutesBasePath}`)
export const honoAppClient = hc<HonoApp>(`${import.meta.env.VITE_BACKEND_URL}${backendAppRoutesBasePath}`)
