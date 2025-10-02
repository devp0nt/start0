import type { HonoAdmin, HonoApp } from '@backend/hono-router'
import { backendHonoAdminRoutesBasePath, backendHonoAppRoutesBasePath } from '@backend/shared/utils'
import { hc } from 'hono/client'

export const honoAdminClient = hc<HonoAdmin>(`${import.meta.env.VITE_BACKEND_URL}${backendHonoAdminRoutesBasePath}`)
export const honoAppClient = hc<HonoApp>(`${import.meta.env.VITE_BACKEND_URL}${backendHonoAppRoutesBasePath}`)
