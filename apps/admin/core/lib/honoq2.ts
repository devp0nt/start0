// import {
//   useMutation as useRQMutation,
//   useQuery as useRQQuery,
//   useSuspenseQuery as useRQSuspenseQuery,
//   type UseMutationOptions,
//   type UseMutationResult,
//   type UseQueryOptions,
//   type UseQueryResult,
//   type UseSuspenseQueryOptions,
//   type UseSuspenseQueryResult,
// } from '@tanstack/react-query'
// import type { InferResponseType } from 'hono/client'
// import type {
//   ClientErrorStatusCode,
//   ServerErrorStatusCode,
//   StatusCode,
//   SuccessStatusCode,
// } from 'hono/utils/http-status'

// // TODO: create honoq3, make it like new trpc do
// // const myQueryOptions = trpc.path.to.query.queryOptions({ /** inputs */ })
// // const myQuery = useQuery(myQueryOptions)

// /* ---------- Types borrowed from your snippet ---------- */

// type ErrorStatusCode = ClientErrorStatusCode | ServerErrorStatusCode
// type HttpMethodKey = '$get' | '$post' | '$put' | '$delete' | '$patch' | '$options' | '$head'
// type AvailableMethodKeys<T> = Extract<keyof T, HttpMethodKey>

// type EndpointMethodParams<T extends object, M extends AvailableMethodKeys<T>> = T[M] extends (
//   params: infer P,
//   ...args: any[]
// ) => any
//   ? P
//   : never

// type EndpointResponseType<
//   T extends object,
//   M extends AvailableMethodKeys<T>,
//   U extends StatusCode = StatusCode,
// > = T[M] extends (...args: any[]) => Promise<Response> ? InferResponseType<T[M], U> : never

// type InferSelectReturnType<TData, TSelect> = TSelect extends (data: TData) => infer R ? R : TData

// type HasUrl<T> = T & { $url: () => URL | { toString: () => string } }

// export type QueryKey<
//   T extends HasUrl<object>,
//   M extends AvailableMethodKeys<T>,
//   Params extends EndpointMethodParams<T, M>,
// > = [M, string, Params]

// function getPathFromUrl(url: string): string {
//   try {
//     if (url.startsWith('http')) {
//       const urlObj = new URL(url)
//       return urlObj.pathname
//     }
//     return url
//   } catch {
//     return url
//   }
// }

// export const getQueryKey = <
//   T extends HasUrl<object>,
//   M extends AvailableMethodKeys<T>,
//   Params extends EndpointMethodParams<T, M>,
// >(
//   endpoint: T,
//   method: M,
//   params: Params,
// ): QueryKey<T, M, Params> => {
//   const urlString = endpoint.$url().toString()
//   const path = getPathFromUrl(urlString)

//   const filteredParams = {} as any
//   if (params && typeof params === 'object') {
//     if ('param' in params) {
//       filteredParams.param = (params as any).param
//     }
//     if ('query' in params) {
//       filteredParams.query = (params as any).query
//     }
//   }
//   return [method, path, filteredParams] as unknown as QueryKey<T, M, Params>
// }

// export const queryOptions = <
//   T extends HasUrl<object>,
//   M extends AvailableMethodKeys<T>,
//   Params extends EndpointMethodParams<T, M>,
//   Options extends Omit<
//     UseQueryOptions<TResponse, TError, InferSelectReturnType<TResponse, TError>, QueryKey<T, M, Params>>,
//     'queryKey' | 'queryFn'
//   >,
//   TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
//   TError = EndpointResponseType<T, M, ErrorStatusCode>,
// >(
//   endpoint: T,
//   method: M,
//   params: Params,
//   options?: Options,
// ) => {
//   const endpointFn = endpoint[method] as unknown as (params: any) => Promise<Response>
//   const result = {
//     queryKey: getQueryKey(endpoint, method, params),
//     queryFn: async () => {
//       const res = await endpointFn(params)
//       if (res.status >= 200 && res.status < 300) {
//         return (await res.json()) as TResponse
//       }
//       const errorData = (await res.json()) as TError
//       const error = new Error(`Request failed with status ${res.status}`) as Error & {
//         status: number
//         data: TError
//       }
//       error.status = res.status
//       error.data = errorData
//       throw error
//     },
//     ...options,
//   }
//   return result as any
// }

// export const mutationOptions = <
//   T extends object,
//   M extends AvailableMethodKeys<T>,
//   TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
//   TError = EndpointResponseType<T, M, ErrorStatusCode>,
//   TVariables = EndpointMethodParams<T, M>,
//   TContext = unknown,
// >(
//   endpoint: HasUrl<T>,
//   method: M,
//   options?: Omit<UseMutationOptions<TResponse, TError, TVariables, TContext>, 'mutationFn' | 'mutationKey'>,
// ): UseMutationOptions<TResponse, TError, TVariables, TContext> => {
//   const endpointFn = endpoint[method] as unknown as (params: TVariables) => Promise<Response>
//   return {
//     mutationKey: getQueryKey(endpoint as any, method as never, {} as any),
//     mutationFn: async (variables) => {
//       const res = await endpointFn(variables)
//       if (res.status >= 200 && res.status < 300) {
//         return (await res.json()) as TResponse
//       }
//       const errorData = (await res.json()) as TError
//       const error = new Error(`Request failed with status ${res.status}`) as Error & {
//         status: number
//         data: TError
//       }
//       error.status = res.status
//       error.data = errorData
//       throw error
//     },
//     ...options,
//   }
// }

// export const useQuery = <
//   T extends HasUrl<object>,
//   M extends AvailableMethodKeys<T>,
//   Params extends EndpointMethodParams<T, M>,
//   Options extends Omit<
//     UseQueryOptions<TResponse, TError, InferSelectReturnType<TResponse, TError>, QueryKey<T, M, Params>>,
//     'queryKey' | 'queryFn'
//   >,
//   TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
//   TError = EndpointResponseType<T, M, ErrorStatusCode>,
// >(
//   endpoint: T,
//   method: M,
//   params: Params,
//   options?: Options,
// ): UseQueryResult<InferSelectReturnType<TResponse, Options extends { select: infer S } ? S : never>, TError> => {
//   // @ts-expect-error – generic narrowing handled by queryOptions above
//   return useRQQuery(queryOptions<T, M, Params, Options, TResponse, TError>(endpoint, method, params, options))
// }

// export const useSuspenseQuery = <
//   T extends HasUrl<object>,
//   M extends AvailableMethodKeys<T>,
//   Params extends EndpointMethodParams<T, M>,
//   Options extends Omit<
//     UseSuspenseQueryOptions<TResponse, TError, InferSelectReturnType<TResponse, TError>, QueryKey<T, M, Params>>,
//     'queryKey' | 'queryFn'
//   >,
//   TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
//   TError = EndpointResponseType<T, M, ErrorStatusCode>,
// >(
//   endpoint: T,
//   method: M,
//   params: Params,
//   options?: Options,
// ): UseSuspenseQueryResult<
//   InferSelectReturnType<TResponse, Options extends { select: infer S } ? S : never>,
//   TError
// > => {
//   return useRQSuspenseQuery(queryOptions<T, M, Params, Options, TResponse, TError>(endpoint, method, params, options))
// }

// export const useMutation = <
//   T extends object,
//   M extends AvailableMethodKeys<T>,
//   TResponse = EndpointResponseType<T, M, SuccessStatusCode>,
//   TError = EndpointResponseType<T, M, ErrorStatusCode>,
//   TVariables = EndpointMethodParams<T, M>,
//   TContext = unknown,
// >(
//   endpoint: HasUrl<T>,
//   method: M,
//   options?: Omit<UseMutationOptions<TResponse, TError, TVariables, TContext>, 'mutationFn' | 'mutationKey'>,
// ): UseMutationResult<TResponse, TError, TVariables, TContext> => {
//   return useRQMutation(mutationOptions<T, M, TResponse, TError, TVariables, TContext>(endpoint, method, options))
// }

// /* ---------- The createHonoQ helper ---------- */

// const METHOD_KEYS: HttpMethodKey[] = ['$get', '$post', '$put', '$delete', '$patch', '$options', '$head']

// type MethodHelper<T extends object, M extends AvailableMethodKeys<T>> = {
//   /** React Query hook wrappers (method preselected) */
//   useQuery: <
//     Params extends EndpointMethodParams<T, M>,
//     Options extends Omit<
//       UseQueryOptions<
//         EndpointResponseType<T, M, SuccessStatusCode>,
//         EndpointResponseType<T, M, ErrorStatusCode>,
//         any,
//         QueryKey<HasUrl<T>, M, Params>
//       >,
//       'queryKey' | 'queryFn'
//     >,
//   >(
//     params: Params,
//     options?: Options,
//   ) => UseQueryResult<
//     InferSelectReturnType<
//       EndpointResponseType<T, M, SuccessStatusCode>,
//       Options extends { select: infer S } ? S : never
//     >,
//     EndpointResponseType<T, M, ErrorStatusCode>
//   >
//   useSuspenseQuery: <
//     Params extends EndpointMethodParams<T, M>,
//     Options extends Omit<
//       UseSuspenseQueryOptions<
//         EndpointResponseType<T, M, SuccessStatusCode>,
//         EndpointResponseType<T, M, ErrorStatusCode>,
//         any,
//         QueryKey<HasUrl<T>, M, Params>
//       >,
//       'queryKey' | 'queryFn'
//     >,
//   >(
//     params: Params,
//     options?: Options,
//   ) => UseSuspenseQueryResult<
//     InferSelectReturnType<
//       EndpointResponseType<T, M, SuccessStatusCode>,
//       Options extends { select: infer S } ? S : never
//     >,
//     EndpointResponseType<T, M, ErrorStatusCode>
//   >
//   useMutation: <TVariables extends EndpointMethodParams<T, M> = EndpointMethodParams<T, M>, TContext = unknown>(
//     options?: Omit<
//       UseMutationOptions<
//         EndpointResponseType<T, M, SuccessStatusCode>,
//         EndpointResponseType<T, M, ErrorStatusCode>,
//         TVariables,
//         TContext
//       >,
//       'mutationFn' | 'mutationKey'
//     >,
//   ) => UseMutationResult<
//     EndpointResponseType<T, M, SuccessStatusCode>,
//     EndpointResponseType<T, M, ErrorStatusCode>,
//     TVariables,
//     TContext
//   >

//   /** Builder helpers if you prefer composing options */
//   queryOptions: <
//     Params extends EndpointMethodParams<T, M>,
//     Options extends Omit<
//       UseQueryOptions<
//         EndpointResponseType<T, M, SuccessStatusCode>,
//         EndpointResponseType<T, M, ErrorStatusCode>,
//         any,
//         QueryKey<HasUrl<T>, M, Params>
//       >,
//       'queryKey' | 'queryFn'
//     >,
//   >(
//     params: Params,
//     options?: Options,
//   ) => ReturnType<typeof queryOptions<HasUrl<T>, M, Params, Options>>
//   mutationOptions: <TVariables extends EndpointMethodParams<T, M> = EndpointMethodParams<T, M>, TContext = unknown>(
//     options?: Omit<
//       UseMutationOptions<
//         EndpointResponseType<T, M, SuccessStatusCode>,
//         EndpointResponseType<T, M, ErrorStatusCode>,
//         TVariables,
//         TContext
//       >,
//       'mutationFn' | 'mutationKey'
//     >,
//   ) => ReturnType<typeof mutationOptions<T, M, any, any, TVariables, TContext>>
// }

// type EndpointBundle<T extends object> = {
//   /** Raw Hono endpoint client (with $get/$post/... and $url) */
//   raw: T
//   /** Pass-through to the endpoint's $url */
//   $url: T extends { $url: () => infer F } ? F : never
// } & {
//   /** A method helper for each available HTTP method on this endpoint */
//   [K in AvailableMethodKeys<T>]: MethodHelper<T, K>
// } & {
//   /**
//    * Default method helpers — available *at runtime* when the endpoint only
//    * has one HTTP method. Typed as `any` here so you can do `ping.useQuery(...)`.
//    * If multiple methods exist, these still exist (bound to the first method)
//    * but we recommend calling `ping.$get.useQuery(...)` for clarity.
//    */
//   useQuery: any
//   useSuspenseQuery: any
//   useMutation: any
//   queryOptions: any
//   mutationOptions: any
// }

// type HonoQ<TClient> = {
//   /** Recursively map client namespaces/endpoints to helpers */
//   [K in keyof TClient]: TClient[K] extends object ? EndpointBundle<TClient[K]> | HonoQ<TClient[K]> : never
// }

// /**
//  * Create a HonoQ helper for a typed Hono client.
//  */
// export function createHonoQ<TClient extends Record<string, any>>(client: TClient): HonoQ<TClient> {
//   const makeMethodHelper = <T extends HasUrl<object>, M extends AvailableMethodKeys<T>>(
//     endpoint: T,
//     method: M,
//   ): MethodHelper<T, M> => {
//     const helper = {
//       useQuery: (params: any, options?: any) => useQuery(endpoint as any, method as never, params, options),
//       useSuspenseQuery: (params: any, options?: any) =>
//         useSuspenseQuery(endpoint as any, method as never, params, options),
//       useMutation: (options?: any) => useMutation(endpoint as any, method as never, options),
//       queryOptions: (params: any, options?: any) => queryOptions(endpoint as any, method as never, params, options),
//       mutationOptions: (options?: any) => mutationOptions(endpoint as any, method as never, options),
//     } as MethodHelper<T, M>
//     return helper
//   }

//   const handler: ProxyHandler<any> = {
//     get(_target, prop: PropertyKey) {
//       const value = (client as any)[prop]
//       if (!value || typeof value !== 'object') return value

//       // If it looks like an endpoint (has $url or method keys), wrap it.
//       const methodKeys = METHOD_KEYS.filter((k) => k in value)
//       const isEndpoint = '$url' in value || methodKeys.length > 0

//       if (isEndpoint) {
//         const endpoint = value as HasUrl<object>
//         const bundle: any = {
//           raw: endpoint,
//           // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
//           $url: endpoint.$url?.bind(endpoint),
//         }

//         // Attach method-specific helpers
//         for (const mk of methodKeys) {
//           bundle[mk] = makeMethodHelper(endpoint, mk as never)
//         }

//         // Default helpers: bind to the first available method (ergonomics for single-method routes)
//         const defaultMethod = methodKeys.find(Boolean)
//         if (defaultMethod) {
//           const defaultHelper = makeMethodHelper(endpoint, defaultMethod as never)
//           bundle.useQuery = defaultHelper.useQuery
//           bundle.useSuspenseQuery = defaultHelper.useSuspenseQuery
//           bundle.useMutation = defaultHelper.useMutation
//           bundle.queryOptions = defaultHelper.queryOptions
//           bundle.mutationOptions = defaultHelper.mutationOptions
//         } else {
//           // No HTTP methods — provide no-op stubs to surface clearer runtime errors
//           const err = async () =>
//             await Promise.reject(
//               new Error(`No HTTP methods found on endpoint "${String(prop)}" (expected $get/$post/...)`),
//             )
//           bundle.useQuery = () => {
//             throw new Error(`No HTTP methods on endpoint "${String(prop)}"`)
//           }
//           bundle.useSuspenseQuery = bundle.useQuery
//           bundle.useMutation = bundle.useQuery
//           bundle.queryOptions = err
//           bundle.mutationOptions = err
//         }

//         return bundle
//       }

//       // Otherwise, recurse (namespace)
//       return createHonoQ(value)
//     },
//   }

//   return new Proxy({}, handler) as HonoQ<TClient>
// }

// /* ---------- Usage example ---------- */
// /*
// import { hc } from 'hono/client'
// import { createHonoQ } from './hono-q'

// const honoAdminClient = hc<HonoAdmin>(`${import.meta.env.VITE_BACKEND_URL}${backendAdminRoutesBasePath}`)
// const honoAppClient = hc<HonoApp>(`${import.meta.env.VITE_BACKEND_URL}${backendAppRoutesBasePath}`)

// export const adminQ = createHonoQ(honoAdminClient)
// export const appQ = createHonoQ(honoAppClient)

// // Single-method route (e.g., only $get exists)
// const ping = appQ.ping.useQuery({})

// // Multi-method route
// const hello = appQ.hello.$get.useQuery({ query: { name: 'oop' } })

// // Mutations
// const mut = appQ.posts.$post.useMutation({
//   onSuccess: () => { /* ... *-/ },
// })
// */
