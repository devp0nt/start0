// https://github.com/orgs/honojs/discussions/3075#discussioncomment-12631479

import {
  type SkipToken,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useMutation as useRQMutation,
  useQuery as useRQQuery,
  useSuspenseQuery as useRQSuspenseQuery,
} from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import type {
  ClientErrorStatusCode,
  ServerErrorStatusCode,
  StatusCode,
  SuccessStatusCode,
} from 'hono/utils/http-status'

type ErrorStatusCode = ClientErrorStatusCode | ServerErrorStatusCode

type HttpMethodKey = '$get' | '$post' | '$put' | '$delete' | '$patch' | '$options' | '$head'

type AvailableMethodKeys<T> = Extract<keyof T, HttpMethodKey>

type EndpointMethodParams<T extends object, M extends AvailableMethodKeys<T>> = T[M] extends (
  params: infer P,
  ...args: any[]
) => any
  ? P
  : never

type EndpointResponseType<
  T extends object,
  M extends AvailableMethodKeys<T>,
  U extends StatusCode = StatusCode,
> = T[M] extends (...args: any[]) => Promise<Response> ? InferResponseType<T[M], U> : never

function getPathFromUrl(url: string): string {
  try {
    if (url.startsWith('http')) {
      const urlObj = new URL(url)
      return urlObj.pathname
    }
    return url
  } catch {
    return url
  }
}

type InferSelectReturnType<TData, TSelect> = TSelect extends (data: TData) => infer R ? R : TData

export type HonoQueryKey<
  T extends object & { $url: () => URL | { toString: () => string } },
  M extends AvailableMethodKeys<T>,
  Params extends EndpointMethodParams<T, M>,
> = [M, string, Params]

export const getHonoQueryKey = <
  T extends object & { $url: () => URL | { toString: () => string } },
  M extends AvailableMethodKeys<T>,
  Params extends EndpointMethodParams<T, M>,
>(
  endpoint: T,
  method: M,
  params: Params,
): HonoQueryKey<T, M, Params> => {
  const urlString = endpoint.$url().toString()
  const path = getPathFromUrl(urlString)

  const filteredParams = {} as any
  if (params && typeof params === 'object') {
    if ('param' in params) {
      filteredParams.param = params.param
    }
    if ('query' in params) {
      filteredParams.query = params.query
    }
  }
  return [method, path, filteredParams] as unknown as HonoQueryKey<T, M, Params>
}

export const honoQueryOptions = <
  T extends object & { $url: () => URL | { toString: () => string } },
  M extends AvailableMethodKeys<T>,
  Params extends EndpointMethodParams<T, M>,
  Options extends Omit<
    UseQueryOptions<TResponse, TError, InferSelectReturnType<TResponse, TError>, HonoQueryKey<T, M, Params>>,
    'queryKey' | 'queryFn'
  >,
  TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
  TError = EndpointResponseType<T, M, ErrorStatusCode>,
>(
  endpoint: T,
  method: M,
  params: Params,
  options?: Options,
): NoInfer<
  Omit<
    UseQueryOptions<TResponse, TError, InferSelectReturnType<TResponse, Options['select']>, HonoQueryKey<T, M, Params>>,
    'queryFn'
  > & {
    queryFn: Exclude<
      UseQueryOptions<
        TResponse,
        TError,
        InferSelectReturnType<TResponse, Options['select']>,
        HonoQueryKey<T, M, Params>
      >['queryFn'],
      SkipToken | undefined
    >
  }
> => {
  const endpointFn = endpoint[method] as unknown as (params: any) => Promise<Response>
  const result = {
    queryKey: getHonoQueryKey(endpoint, method, params),
    queryFn: async () => {
      const res = await endpointFn(params)
      if (res.status >= 200 && res.status < 300) {
        return (await res.json()) as TResponse
      }
      const errorData = (await res.json()) as TError

      const error = new Error(`Request failed with status ${res.status}`) as Error & {
        status: number
        data: TError
      }

      error.status = res.status
      error.data = errorData

      throw error
    },
    ...options,
  }

  return result as any
}

export const honoMutationOptions = <
  T extends object,
  M extends AvailableMethodKeys<T>,
  TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
  TError = EndpointResponseType<T, M, ErrorStatusCode>,
  TVariables = EndpointMethodParams<T, M>,
  TContext = unknown,
>(
  endpoint: T & { $url: () => URL | { toString: () => string } },
  method: M,
  options?: Omit<UseMutationOptions<TResponse, TError, TVariables, TContext>, 'mutationFn' | 'mutationKey'>,
): UseMutationOptions<TResponse, TError, TVariables, TContext> => {
  const endpointFn = endpoint[method] as unknown as (params: TVariables) => Promise<Response>

  return {
    mutationKey: getHonoQueryKey(endpoint, method, {} as any),
    mutationFn: async (variables) => {
      const res = await endpointFn(variables)
      if (res.status >= 200 && res.status < 300) {
        return (await res.json()) as TResponse
      }
      const errorData = (await res.json()) as TError

      const error = new Error(`Request failed with status ${res.status}`) as Error & {
        status: number
        data: TError
      }

      error.status = res.status
      error.data = errorData

      throw error
    },
    ...options,
  }
}

export const useHonoQuery = <
  T extends object & { $url: () => URL | { toString: () => string } },
  M extends AvailableMethodKeys<T>,
  Params extends EndpointMethodParams<T, M>,
  Options extends Omit<
    UseQueryOptions<TResponse, TError, InferSelectReturnType<TResponse, TError>, HonoQueryKey<T, M, Params>>,
    'queryKey' | 'queryFn'
  >,
  TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
  TError = EndpointResponseType<T, M, ErrorStatusCode>,
>(
  endpoint: T & { $url: () => URL | { toString: () => string } },
  method: M,
  params: Params,
  options?: Options,
): UseQueryResult<InferSelectReturnType<TResponse, Options['select']>, TError> => {
  return useRQQuery(honoQueryOptions<T, M, Params, Options, TResponse, TError>(endpoint, method, params, options))
}

export const useSuspenseHonoQuery = <
  T extends object & { $url: () => URL | { toString: () => string } },
  M extends AvailableMethodKeys<T>,
  Params extends EndpointMethodParams<T, M>,
  Options extends Omit<
    UseSuspenseQueryOptions<TResponse, TError, InferSelectReturnType<TResponse, TError>, HonoQueryKey<T, M, Params>>,
    'queryKey' | 'queryFn'
  >,
  TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
  TError = EndpointResponseType<T, M, ErrorStatusCode>,
>(
  endpoint: T & { $url: () => URL | { toString: () => string } },
  method: M,
  params: Params,
  options?: Options,
): UseSuspenseQueryResult<InferSelectReturnType<TResponse, Options['select']>, TError> => {
  return useRQSuspenseQuery(
    honoQueryOptions<T, M, Params, Options, TResponse, TError>(endpoint, method, params, options),
  )
}

export const useHonoMutation = <
  T extends object,
  M extends AvailableMethodKeys<T>,
  TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
  TError = EndpointResponseType<T, M, ErrorStatusCode>,
  TVariables = EndpointMethodParams<T, M>,
  TContext = unknown,
>(
  endpoint: T & { $url: () => URL | { toString: () => string } },
  method: M,
  options?: Omit<UseMutationOptions<TResponse, TError, TVariables, TContext>, 'mutationFn' | 'mutationKey'>,
): UseMutationResult<TResponse, TError, TVariables, TContext> => {
  return useRQMutation(honoMutationOptions<T, M, TResponse, TError, TVariables, TContext>(endpoint, method, options))
}

// Example

// const client = hc('/api')
// const data = useHonoQuery(client.posts, '$get', { query: { filter: 'active' } }, { staleTime: 60000 })
// const data = useHonoQuery(queryOptions(client.posts, '$get', { query: { filter: 'active' } }, { staleTime: 60000 }))
// const data = useHonoQuery(queryOptions(client.posts, '$post', { json: { name: 'john' } }))
