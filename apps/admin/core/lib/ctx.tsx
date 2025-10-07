import { Loader } from '@admin/core/components/loader'
import { createEnv, type Env } from '@admin/core/lib/env'
import { Alert } from 'antd'
import { createContext, useContext, useContextSelector } from 'use-context-selector'
import { useQuery } from '@tanstack/react-query'
import { trpc } from '@admin/core/lib/trpc'
import type { TrpcRouterOutput } from '@backend/trpc-router'

export namespace AdminCtx {
  export type Admin = { id: string; name: string; email: string }
  export type Me = { admin: Admin | null }
  export type Config = TrpcRouterOutput['app']['getConfig']['config']
  export type Ctx = {
    me: Me
    config: Config
    env: Env
  }

  const ReactContext = createContext<Ctx>(null as never)

  export const Provider = ({ children }: { children: React.ReactNode }) => {
    const getConfigQr = useQuery(
      trpc.app.getConfig.queryOptions(undefined, {
        staleTime: Infinity,
      }),
    )
    const envParseResult = ((): { env: Env; error: null } | { env: null; error: unknown } => {
      try {
        return { env: createEnv(import.meta.env), error: null }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        return { error, env: null }
      }
    })()
    if (envParseResult.error || !envParseResult.env) {
      return (
        <Alert
          type="error"
          message={envParseResult.error instanceof Error ? envParseResult.error.message : 'Unknown error'}
        />
      )
    }
    const error = getConfigQr.error
    const pending = getConfigQr.isLoading
    if (error) {
      return <Alert type="error" message={error.message} />
    }
    if (pending) {
      return <Loader type="site" />
    }
    const adminCtx: Partial<Ctx> = {
      me: {
        admin: null,
      },
      config: getConfigQr.data?.config,
      env: envParseResult.env,
    }
    return <ReactContext.Provider value={adminCtx as Ctx}>{children}</ReactContext.Provider>
  }

  export const useCtx = () => {
    return useContext(ReactContext)
  }
  export const useMe = () => useContextSelector(ReactContext, (ctx) => ctx.me)
  export const useConfig = () => useContextSelector(ReactContext, (ctx) => ctx.config)
  export const useEnv = () => useContextSelector(ReactContext, (ctx) => ctx.env)
}
