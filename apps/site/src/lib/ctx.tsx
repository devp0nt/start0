import { type DehydratedState, dehydrate, type QueryClient, useQuery } from "@tanstack/react-query"
import {
  unstable_createContext,
  type unstable_MiddlewareFunction,
  type unstable_RouterContextProvider,
} from "react-router"
import { createContext, useContext, useContextSelector } from "use-context-selector"
import type { BackendTrpcRouter } from "@/backend/router/index.trpc"
import { getQueryClient, trpc } from "@/site/src/lib/trpc"

export namespace SiteCtx {
  export type MeUser = { id: string; name: string; email: string }
  export type MeAdmin = { id: string; name: string; phone: string }
  export type Me = { user: MeUser | null; admin: MeAdmin | null }
  export type AppConfig = BackendTrpcRouter.Output["getAppConfig"]["appConfig"]
  export type Ctx = {
    me: Me
    appConfig: AppConfig
  }

  export const loader = async ({ qc }: { qc: QueryClient }): Promise<{ siteCtx: Ctx }> => {
    const getAppConfigData = await qc.fetchQuery(
      trpc.getAppConfig.queryOptions(undefined, {
        staleTime: Infinity,
      }),
    )
    const siteCtx: Ctx = {
      me: {
        user: null,
        admin: null,
      },
      appConfig: getAppConfigData.appConfig,
    }
    return {
      siteCtx,
    }
  }

  const ReactContext = createContext<Ctx>(null as never)

  export const Provider = ({ children }: { children: React.ReactNode }) => {
    const getAppConfigQr = useQuery(
      trpc.getAppConfig.queryOptions(undefined, {
        staleTime: Infinity,
      }),
    )
    const siteCtx: Partial<Ctx> = {
      me: {
        user: null,
        admin: null,
      },
      appConfig: getAppConfigQr.data?.appConfig,
    }
    const error = getAppConfigQr.error
    const pending = getAppConfigQr.isPending
    return (
      <ReactContext.Provider value={siteCtx as Ctx}>
        {error ? <div>{error.message}</div> : pending ? <div>Loading...</div> : children}
      </ReactContext.Provider>
    )
  }

  export const useCtx = () => {
    return useContext(ReactContext)
  }
  export const useMe = () => useContextSelector(ReactContext, (ctx) => ctx.me)
  export const useAppConfig = () => useContextSelector(ReactContext, (ctx) => ctx.appConfig)

  const rrContext = unstable_createContext<{
    siteCtx: Ctx | null
    dehydratedState: DehydratedState | null
  }>({
    siteCtx: null,
    dehydratedState: null,
  })

  export const rrMiddleware: unstable_MiddlewareFunction = async ({ context }) => {
    const qc = getQueryClient()
    const { siteCtx } = await SiteCtx.loader({ qc })
    context.set(rrContext, {
      siteCtx,
      dehydratedState: dehydrate(qc),
    })
  }

  export const rrGetFromContextOrThrow = ({ context }: { context: Readonly<unstable_RouterContextProvider> }) => {
    const result = context.get(rrContext)
    if (!result) {
      throw new Error("siteCtx holder not found in react router context")
    }
    const { siteCtx, dehydratedState } = result
    if (!siteCtx) {
      throw new Error("siteCtx holder found in react router context, but siteCtx is null")
    }
    if (!dehydratedState) {
      throw new Error("siteCtx holder found in react router context, but dehydratedState is null")
    }
    return {
      siteCtx,
      dehydratedState,
    }
  }
}
