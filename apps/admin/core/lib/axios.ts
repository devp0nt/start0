import { backendAdminRoutesBasePath } from '@backend/shared/utils'
import type { HttpError } from '@refinedev/core'
import Axios, { isAxiosError } from 'axios'

export const axiosInstance = Axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}${backendAdminRoutesBasePath}`,
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  // config.headers['X-Any-Header'] = ...
  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (isAxiosError(error)) {
      const dataRaw = error.response?.data
      const errorNormalized = typeof dataRaw === 'string' ? { error: { message: dataRaw } } : (dataRaw ?? {})
      const customError: HttpError = {
        data: errorNormalized.error,
        message: errorNormalized.error?.message || 'Unknown error',
        statusCode: error.response?.status || 500,
      }
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return await Promise.reject(customError)
    } else {
      const customError: HttpError = {
        data: error,
        message: error.message || 'Unknown error',
        statusCode: 500,
      }
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return await Promise.reject(customError)
    }
  },
)
