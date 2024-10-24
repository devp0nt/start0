import type { ExpressRequestWithClientData } from '@/backend/src/services/other/requestClientData.js'
import type { ExpressRequestWithMe } from '@/general/src/auth/utils.server.js'
import type { Request, Response } from 'express'
import type { ExpressRequestWithStorik, ExpressResponseWithStorik } from 'svag-storik/dist/server.js'

export type ExpressRequest = Request & ExpressRequestWithStorik & ExpressRequestWithMe & ExpressRequestWithClientData
export type ExpressResponse = Response & ExpressResponseWithStorik
