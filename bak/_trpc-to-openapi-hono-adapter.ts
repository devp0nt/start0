// TODO: remove it
// // TODO: wait for implementation in original repo

// /* eslint-disable @typescript-eslint/no-empty-function */
// import type { Context, MiddlewareHandler } from 'hono'
// import { createOpenApiNodeHttpHandler } from 'trpc-to-openapi'
// import type { OpenApiRouter } from 'trpc-to-openapi'
// import type { IncomingMessage, ServerResponse } from 'node:http'
// import { Readable } from 'node:stream'

// export type CreateOpenApiHonoHandlerOptions<TRouter extends OpenApiRouter> = {
//   router: TRouter
//   createContext?: (opts: { req: IncomingMessage; res: ServerResponse }) => any
//   responseMeta?: any
//   onError?: any
//   maxBodySize?: number
// }

// /**
//  * Creates a Hono middleware handler for tRPC OpenAPI routes
//  */
// export const createOpenApiHonoHandler = <TRouter extends OpenApiRouter>(
//   opts: CreateOpenApiHonoHandlerOptions<TRouter>,
// ): MiddlewareHandler => {
//   const openApiHandler = createOpenApiNodeHttpHandler(opts as any)

//   return async (c: Context, next) => {
//     const req = c.req
//     const url = new URL(req.url)

//     // Extract the path relative to the base path for trpc-to-openapi
//     const relativePath = url.pathname.replace('/api/trpc/admin', '') || '/'
//     const relativeUrl = relativePath + url.search

//     const nodeReq = Object.assign(new Readable(), {
//       method: req.method,
//       url: relativeUrl,
//       headers: Object.fromEntries(req.raw.headers.entries()),
//       httpVersion: '1.1',
//       httpVersionMajor: 1,
//       httpVersionMinor: 1,
//       connection: {},
//       socket: {},
//       complete: true,
//       readable: true,
//       query: Object.fromEntries(url.searchParams.entries()),
//       body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.json().catch(() => ({})) : undefined,
//       honoContext: c, // Pass Hono context for tRPC context creation
//     }) as IncomingMessage & { body?: unknown; query?: unknown; honoContext?: Context }

//     // Create a Node.js compatible response object
//     let statusCode = 200
//     const headers: Record<string, string> = {}
//     let responseBody = ''

//     const nodeRes = {
//       statusCode,
//       setHeader: (name: string, value: string) => {
//         headers[name] = value
//       },
//       getHeader: (name: string) => headers[name],
//       removeHeader: (name: string) => {
//         // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
//         delete headers[name]
//       },
//       writeHead: (
//         code: number,
//         reasonPhrase?: string | Record<string, string>,
//         responseHeaders?: Record<string, string>,
//       ) => {
//         statusCode = code
//         if (typeof reasonPhrase === 'object') {
//           Object.assign(headers, reasonPhrase)
//         } else if (responseHeaders) {
//           Object.assign(headers, responseHeaders)
//         }
//       },
//       write: (chunk: string) => {
//         responseBody += chunk
//       },
//       end: (chunk?: string) => {
//         if (chunk) {
//           responseBody += chunk
//         }
//       },
//       finished: false,
//       headersSent: false,
//       // Add EventEmitter methods that tRPC expects
//       once: () => {},
//       on: () => {},
//       emit: () => {},
//       removeListener: () => {},
//       addListener: () => {},
//     } as unknown as ServerResponse

//     try {
//       await openApiHandler(nodeReq, nodeRes)

//       // Set headers
//       Object.entries(headers).forEach(([key, value]) => {
//         c.header(key, value)
//       })

//       // Return response
//       // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
//       if (headers['content-type']?.includes('application/json')) {
//         try {
//           return c.json(JSON.parse(responseBody), statusCode as any)
//         } catch {
//           return c.text(responseBody, statusCode as any)
//         }
//       } else {
//         return c.text(responseBody, statusCode as any)
//       }
//     } catch (error) {
//       // Log error using proper logging mechanism if available
//       // console.error('OpenAPI Hono handler error:', error)
//       return c.json({ error: 'Internal server error' }, 500)
//     }
//   }
// }

// /**
//  * Creates a Hono middleware that handles all OpenAPI routes for a tRPC router
//  */
// export const createOpenApiHonoMiddleware = <TRouter extends OpenApiRouter>(
//   opts: CreateOpenApiHonoHandlerOptions<TRouter>,
// ): MiddlewareHandler => {
//   return createOpenApiHonoHandler(opts)
// }
