// createReactQueryHonoClient.ts
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import type { Hono } from 'hono'
import { hc, type InferResponseType } from 'hono/client'
import type {
  ClientErrorStatusCode,
  ServerErrorStatusCode,
  StatusCode,
  SuccessStatusCode,
} from 'hono/utils/http-status'

// ───────────────────────────────────────────────────────────────────────────────
// Shared helpers & types
// ───────────────────────────────────────────────────────────────────────────────

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

type HasUrl = { $url: () => URL | { toString: () => string } }
type InferSelectReturnType<TData, TSelect> = TSelect extends (data: TData) => infer R ? R : TData

function getPathFromUrl(url: string): string {
  try {
    if (url.startsWith('http')) return new URL(url).pathname
    return url
  } catch {
    return url
  }
}

export type HonoQueryKey<
  T extends HasUrl,
  M extends AvailableMethodKeys<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Params extends EndpointMethodParams<T, M>,
> = [M, string, { param?: unknown; query?: unknown }]

export const getHonoQueryKey = <
  T extends HasUrl,
  M extends AvailableMethodKeys<T>,
  Params extends EndpointMethodParams<T, M>,
>(
  endpoint: T,
  method: M,
  params: Params,
): HonoQueryKey<T, M, Params> => {
  const path = getPathFromUrl(endpoint.$url().toString())
  const filtered: any = {}
  if (params && typeof params === 'object') {
    if ('param' in (params as any)) filtered.param = (params as any).param
    if ('query' in (params as any)) filtered.query = (params as any).query
  }
  return [method, path, filtered] as unknown as HonoQueryKey<T, M, Params>
}

async function handleJson<TResponse, TError>(res: Response): Promise<TResponse> {
  if (res.status >= 200 && res.status < 300) return (await res.json()) as TResponse
  const errorData = (await res.json().catch(() => undefined)) as TError | undefined
  const err = new Error(`Request failed with status ${res.status}`) as Error & { status: number; data?: TError }
  err.status = res.status
  err.data = errorData
  throw err
}

export const honoQueryOptions = <
  T extends HasUrl,
  M extends AvailableMethodKeys<T>,
  Params extends EndpointMethodParams<T, M>,
  Options extends Omit<
    UseQueryOptions<TResponse, TError, InferSelectReturnType<TResponse, Options['select']>, HonoQueryKey<T, M, Params>>,
    'queryKey' | 'queryFn'
  >,
  TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
  TError = EndpointResponseType<T, M, ErrorStatusCode>,
>(
  endpoint: T,
  method: M,
  params: Params,
  options?: Options,
) => {
  // callable (function) or request-builder with .fetch
  const methodNode = (endpoint as any)[method] as
    | ((p: Params) => Promise<Response>)
    | { fetch: (p: Params, init?: RequestInit) => Promise<Response> }

  const callOnce = async () => {
    if (typeof methodNode === 'function') return await handleJson<TResponse, TError>(await methodNode(params))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (methodNode && typeof (methodNode as any).fetch === 'function') {
      return await handleJson<TResponse, TError>(await (methodNode as any).fetch(params))
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
    throw new Error(`Unsupported Hono method node for ${String(method)}`)
  }

  const result = {
    queryKey: getHonoQueryKey(endpoint, method, params),
    queryFn: callOnce,
    ...(options as object),
  }

  return result as UseQueryOptions<
    TResponse,
    TError,
    InferSelectReturnType<TResponse, Options extends { select?: any } ? Options['select'] : never>,
    HonoQueryKey<T, M, Params>
  >
}

export const honoMutationOptions = <
  T extends HasUrl,
  M extends AvailableMethodKeys<T>,
  TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
  TError = EndpointResponseType<T, M, ErrorStatusCode>,
  TVariables = EndpointMethodParams<T, M>,
  TContext = unknown,
>(
  endpoint: T,
  method: M,
  options?: Omit<UseMutationOptions<TResponse, TError, TVariables, TContext>, 'mutationFn' | 'mutationKey'>,
): UseMutationOptions<TResponse, TError, TVariables, TContext> => {
  const methodNode = (endpoint as any)[method] as
    | ((p: TVariables) => Promise<Response>)
    | { fetch: (p: TVariables, init?: RequestInit) => Promise<Response> }

  const callOnce = async (variables: TVariables) => {
    if (typeof methodNode === 'function') return await handleJson<TResponse, TError>(await methodNode(variables))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (methodNode && typeof (methodNode as any).fetch === 'function') {
      return await handleJson<TResponse, TError>(await (methodNode as any).fetch(variables))
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
    throw new Error(`Unsupported Hono method node for ${String(method)}`)
  }

  return {
    mutationKey: getHonoQueryKey(endpoint as any, method as never, {} as any),
    mutationFn: callOnce,
    ...(options as object),
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Type that mirrors your client but augments each HTTP method with helpers
// ───────────────────────────────────────────────────────────────────────────────

type AugmentMethod<TNode extends HasUrl, M extends AvailableMethodKeys<TNode>> = TNode[M] & {
  queryOptions: <
    Params extends EndpointMethodParams<TNode, M>,
    Options extends Omit<
      UseQueryOptions<
        EndpointResponseType<TNode, M, SuccessStatusCode>,
        EndpointResponseType<TNode, M, ErrorStatusCode>,
        any,
        HonoQueryKey<TNode, M, Params>
      >,
      'queryKey' | 'queryFn'
    >,
  >(
    params: Params,
    options?: Options,
  ) => UseQueryOptions<
    EndpointResponseType<TNode, M, SuccessStatusCode>,
    EndpointResponseType<TNode, M, ErrorStatusCode>,
    InferSelectReturnType<
      EndpointResponseType<TNode, M, SuccessStatusCode>,
      Options extends { select?: infer S } ? S : never
    >,
    HonoQueryKey<TNode, M, Params>
  >
  getQueryKey: <Params extends EndpointMethodParams<TNode, M>>(params: Params) => HonoQueryKey<TNode, M, Params>
  queryFn: <
    TRes = EndpointResponseType<TNode, M, SuccessStatusCode>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TErr = EndpointResponseType<TNode, M, ErrorStatusCode>,
  >(
    params: EndpointMethodParams<TNode, M>,
  ) => () => Promise<TRes>
  mutationOptions: <
    TResponse = EndpointResponseType<TNode, M, SuccessStatusCode>,
    TError = EndpointResponseType<TNode, M, ErrorStatusCode>,
    TVariables = EndpointMethodParams<TNode, M>,
    TContext = unknown,
  >(
    options?: Omit<UseMutationOptions<TResponse, TError, TVariables, TContext>, 'mutationFn' | 'mutationKey'>,
  ) => UseMutationOptions<TResponse, TError, TVariables, TContext>
}

export type HonoClientWithReactQuery<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? T extends HasUrl
      ? {
          [K in keyof T]: K extends AvailableMethodKeys<T>
            ? AugmentMethod<T, Extract<K, HttpMethodKey>>
            : HonoClientWithReactQuery<T[K]>
        }
      : { [K in keyof T]: HonoClientWithReactQuery<T[K]> }
    : T

// ───────────────────────────────────────────────────────────────────────────────
// Proxies
// ───────────────────────────────────────────────────────────────────────────────

const HTTP_METHODS: readonly HttpMethodKey[] = [
  '$get',
  '$post',
  '$put',
  '$delete',
  '$patch',
  '$options',
  '$head',
] as const

function wrapMethodNode<T extends HasUrl>(endpointObj: T, method: HttpMethodKey, rawMethodNode: any): any {
  // Build a callable that delegates to the underlying node (function or { fetch })
  const callImpl = (args: any) => {
    if (typeof rawMethodNode === 'function') return rawMethodNode(args)
    if (rawMethodNode && typeof rawMethodNode.fetch === 'function') return rawMethodNode.fetch(args)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
    throw new Error(`Unsupported Hono method node for ${String(method)}`)
  }

  // Return a callable proxy that *also* serves our virtual helpers.
  const callable = function (this: any, ...args: [any]) {
    return callImpl(args[0])
  } as any

  return new Proxy(callable, {
    apply(_t, _thisArg, argArray) {
      return callImpl(argArray[0])
    },
    get(_t, prop, receiver) {
      if (prop === 'queryOptions') {
        return (params: any, options?: any) => honoQueryOptions(endpointObj as any, method as never, params, options)
      }
      if (prop === 'getQueryKey') {
        return (params: any) => getHonoQueryKey(endpointObj as any, method as never, params)
      }
      if (prop === 'queryFn') {
        return (params: any) => {
          return async () => {
            const res = await callImpl(params)
            return await handleJson(res)
          }
        }
      }
      if (prop === 'mutationOptions') {
        return (options?: any) => honoMutationOptions(endpointObj as any, method as never, options)
      }
      // Also forward known properties from the raw node (e.g. .fetch)
      const raw = rawMethodNode[prop]
      return typeof raw === 'function' ? raw.bind(rawMethodNode) : raw
    },
  })
}

function addReactQueryToHonoClient<TClient extends object>(original: TClient): HonoClientWithReactQuery<TClient> {
  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      // 1) Intercept HTTP method *by property name first* to avoid path pollution like "/$get/queryOptions"
      if (HTTP_METHODS.includes(prop as HttpMethodKey)) {
        const endpointObj = target as HasUrl
        const rawMethodNode = Reflect.get(target, prop, receiver)
        return wrapMethodNode(endpointObj, prop as HttpMethodKey, rawMethodNode)
      }

      // 2) Recurse into nested route objects
      const value = Reflect.get(target, prop, receiver)
      if (value && typeof value === 'object') {
        return new Proxy(value, handler)
      }

      return value
    },
  }

  return new Proxy(original as any, handler) as HonoClientWithReactQuery<TClient>
}

// ───────────────────────────────────────────────────────────────────────────────
// Public factory
// ───────────────────────────────────────────────────────────────────────────────

type Client<TApp extends Hono<any, any, any>> = Exclude<ReturnType<typeof hc<TApp>>, unknown>

export function createReactQueryHonoClient<
  TApp extends Hono<any, any, any>,
  // TClient extends Client<TApp> = Client<TApp>,
  TClient extends Client<TApp> = Client<TApp>,
>(baseUrl: string): HonoClientWithReactQuery<TClient> {
  const original = hc<TApp>(baseUrl) as TClient
  return addReactQueryToHonoClient<TClient>(original)
}

// ───────────────────────────────────────────────────────────────────────────────
// Usage
// ───────────────────────────────────────────────────────────────────────────────
//
// import type { HonoAdmin, HonoApp } from '@backend/hono-router'
// import { createReactQueryHonoClient } from './createReactQueryHonoClient'
// import { useQuery } from '@tanstack/react-query'
//
// export const honoAdminClient = createReactQueryHonoClient<HonoAdmin>(
//   `${import.meta.env.VITE_BACKEND_URL}${backendHonoAdminRoutesBasePath}`,
// )
//
// export const honoAppClient = createReactQueryHonoClient<HonoApp>(
//   `${import.meta.env.VITE_BACKEND_URL}${backendHonoAppRoutesBasePath}`,
// )
//
// // Exactly like you want:
// useQuery(honoAppClient.posts.$get.queryOptions({ query: { filter: 'active' } }), { staleTime: 60_000 })
//
// // Also works for endpoints without params:
// useQuery(honoAppClient.ping.$get.queryOptions({}), { staleTime: 60_000 })
