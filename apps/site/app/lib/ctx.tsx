import type { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc"
import { trpc } from "@shmoject/site/lib/trpc"
import { type QueryClient, useQuery } from "@tanstack/react-query"
import { get, isEqual, isObject, keys, sortBy } from "lodash"
import { useMatches } from "react-router"
import {
  createContext,
  useContext,
  useContextSelector,
} from "use-context-selector"

// export const useLoaderData = (): { ctx: Ctx | undefined } => {
//   const desiredKeys = sortBy(keys(defaultValue))
//   const matches = useMatches()
//   const result = matches.find((match) => {
//     const loaderData = match.loaderData
//     if (!isObject(loaderData)) return false
//     const ctx = get(loaderData, "ctx")
//     if (!isObject(ctx)) return false
//     const actualKeys = sortBy(keys(ctx))
//     return isEqual(desiredKeys, actualKeys)
//   }) as { loaderData: { ctx: Ctx } } | undefined
//   return { ctx: result?.loaderData?.ctx }
// }

// export const Provider = ({ children }: { children: React.ReactNode }) => {
//   const qr = useQuery(trpc.getAppConfig.queryOptions())
//   const value = {
//     ...defaultValue,
//     appConfig: qr.data?.appConfig ?? defaultValue.appConfig,
//   }
//   return (
//     <ReactContext.Provider value={value}>
//       {qr.isError ? (
//         <div>Error</div>
//       ) : qr.isPending ? (
//         <div>Loading...</div>
//       ) : (
//         children
//       )}
//     </ReactContext.Provider>
//   )
// }

export namespace SiteCtx {
  export type MeUser = { id: string; name: string; email: string }
  export type MeAdmin = { id: string; name: string; phone: string }
  export type Me = { user: MeUser | null; admin: MeAdmin | null }
  export type AppConfig = BackendTrpcRouter.Output["getAppConfig"]["appConfig"]
  export type Ctx = {
    me: Me
    appConfig: AppConfig
  }

  const defaultValue: Ctx = {
    me: {
      user: null,
      admin: null,
    },
    appConfig: {
      rubInUsd: 87,
    },
  }

  const mergeWithDefaultValue = (data: Partial<Ctx>) => {
    return {
      ...defaultValue,
      appConfig: data.appConfig ?? defaultValue.appConfig,
    } as Ctx
  }

  export const loader = async ({ qc }: { qc: QueryClient }) => {
    const getAppConfigData = await qc.fetchQuery(
      trpc.getAppConfig.queryOptions(undefined, {
        staleTime: Infinity,
      }),
    )
    return {
      ctx: mergeWithDefaultValue({
        appConfig: getAppConfigData.appConfig,
      }),
    }
  }

  const ReactContext = createContext<Ctx>(defaultValue)

  export const Provider = ({ children }: { children: React.ReactNode }) => {
    const getAppConfigQr = useQuery(
      trpc.getAppConfig.queryOptions(undefined, {
        staleTime: Infinity,
      }),
    )
    const value = mergeWithDefaultValue({
      appConfig: getAppConfigQr.data?.appConfig,
    })
    const error = getAppConfigQr.error
    const pending = getAppConfigQr.isPending
    return (
      <ReactContext.Provider value={value}>
        {error ? (
          <div>{error.message}</div>
        ) : pending ? (
          <div>Loading...</div>
        ) : (
          children
        )}
      </ReactContext.Provider>
    )
  }

  export const use = () => {
    return useContext(ReactContext)
  }
  export const useMe = () => useContextSelector(ReactContext, (ctx) => ctx.me)
  export const useAppConfig = () =>
    useContextSelector(ReactContext, (ctx) => ctx.appConfig)
}
