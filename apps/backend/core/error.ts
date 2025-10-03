import z from 'zod'
import { Error0 } from '@devp0nt/error0'

export const zErrorResponse = z.object({
  error: z.object({ message: z.string() }),
  data: z.any().optional(),
})
export type ErrorResponse = z.infer<typeof zErrorResponse>
export const toErrorResponse = (error: unknown, data?: Record<string, unknown>) => {
  const error0 = Error0.from(error)
  return {
    error: error0.toJSON(),
    data,
  }
}
export function toErrorResponseWithStatus<TStatus extends number = 500>(
  error: unknown,
  status?: TStatus,
): [ErrorResponse, TStatus]
export function toErrorResponseWithStatus<TStatus extends number = 500>(
  error: unknown,
  data?: Record<string, unknown>,
  status?: TStatus,
): [ErrorResponse, TStatus]
export function toErrorResponseWithStatus(
  error: unknown,
  dataOrStatus?: Record<string, unknown> | number,
  maybeStatus?: number,
) {
  const { data, status } = (() => {
    if (typeof dataOrStatus === 'number') {
      return { data: undefined, status: dataOrStatus }
    }
    return { data: dataOrStatus, status: maybeStatus }
  })()
  const error0 = Error0.from(error)
  return [
    {
      error: error0.toJSON(),
      data,
    },
    status || error0.httpStatus || 500,
  ]
}
