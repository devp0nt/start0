/* eslint-disable @typescript-eslint/no-unnecessary-type-conversion */
// createReactQueryHonoClient.ts
import { hc, type InferResponseType } from 'hono/client'
import type { Hono } from 'hono'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
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
  const getMethodNode = () =>
    (endpoint as any)[method] as
      | ((p: Params) => Promise<Response>)
      | { fetch: (p: Params, init?: RequestInit) => Promise<Response> }

  const callOnce = async () => {
    const node = getMethodNode()
    if (typeof node === 'function') return await handleJson<TResponse, TError>(await node(params))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (node && typeof (node as any).fetch === 'function') {
      return await handleJson<TResponse, TError>(await (node as any).fetch(params))
    }
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
  const getMethodNode = () =>
    (endpoint as any)[method] as
      | ((p: TVariables) => Promise<Response>)
      | { fetch: (p: TVariables, init?: RequestInit) => Promise<Response> }

  const callOnce = async (variables: TVariables) => {
    const node = getMethodNode()
    if (typeof node === 'function') return await handleJson<TResponse, TError>(await node(variables))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (node && typeof (node as any).fetch === 'function') {
      return await handleJson<TResponse, TError>(await (node as any).fetch(variables))
    }
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

function wrapMethodFacade<T extends HasUrl>(endpointObj: T, method: HttpMethodKey): any {
  const getMethodNode = () => (endpointObj as any)[method]

  // Callable facade that delegates to the real node lazily
  const callable = function (this: any, ...args: [any]) {
    const node = getMethodNode()
    if (typeof node === 'function') return node(args[0])
    if (node && typeof node.fetch === 'function') return node.fetch(args[0])
    throw new Error(`Unsupported Hono method node for ${String(method)}`)
  } as any

  return new Proxy(callable, {
    apply(_t, _thisArg, argArray) {
      const node = getMethodNode()
      if (typeof node === 'function') return node(argArray[0])
      if (node && typeof node.fetch === 'function') return node.fetch(argArray[0])
      throw new Error(`Unsupported Hono method node for ${String(method)}`)
    },
    get(_t, prop, _receiver) {
      if (prop === 'queryOptions') {
        return (params: any, options?: any) => honoQueryOptions(endpointObj as any, method as never, params, options)
      }
      if (prop === 'getQueryKey') {
        return (params: any) => getHonoQueryKey(endpointObj as any, method as never, params)
      }
      if (prop === 'queryFn') {
        return (params: any) => {
          return async () => {
            const node = getMethodNode()
            if (typeof node === 'function') return await handleJson(await node(params))
            if (node && typeof node.fetch === 'function') return await handleJson(await node.fetch(params))
            throw new Error(`Unsupported Hono method node for ${String(method)}`)
          }
        }
      }
      if (prop === 'mutationOptions') {
        return (options?: any) => honoMutationOptions(endpointObj as any, method as never, options)
      }

      // Forward other props to the real node (e.g., `.fetch`, `.aborted`, etc.)
      const node = getMethodNode()
      const raw = node?.[prop as any]
      return typeof raw === 'function' ? raw.bind(node) : raw
    },
  })
}

function addReactQueryToHonoClient<TClient extends object>(original: TClient): HonoClientWithReactQuery<TClient> {
  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      // Intercept method names BEFORE touching the underlying node
      if (HTTP_METHODS.includes(prop as HttpMethodKey)) {
        const endpointObj = target as HasUrl
        return wrapMethodFacade(endpointObj, prop as HttpMethodKey)
      }

      // Recurse into both objects AND functions (Hono returns function-like builders)
      const value = Reflect.get(target, prop, receiver)
      if (value && (typeof value === 'object' || typeof value === 'function')) {
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

type Client<TApp extends Hono<any, any, any>> = Extract<ReturnType<typeof hc<TApp>>, object>

export function createReactQueryHonoClient<
  TApp extends Hono<any, any, any>,
  TClient extends Client<TApp> = Client<TApp>,
>(baseUrl: string): HonoClientWithReactQuery<TClient> {
  const original = hc<TApp>(baseUrl) as TClient
  return addReactQueryToHonoClient<TClient>(original)
}

export type HonoClientOutput<T extends (...args: any[]) => any> = Awaited<ReturnType<Awaited<ReturnType<T>>['json']>>
export type HonoClientInput<T extends (...args: any[]) => any> = Parameters<T>[0]
