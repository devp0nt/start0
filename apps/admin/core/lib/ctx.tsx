import { Loader } from '@admin/core/components/loader'
import { createEnv, type Env } from '@admin/core/lib/env'
import { useOpenapiSchemaLoader, type OpenapiSchema } from '@admin/core/lib/schema'
import { backendAdminRoutesBasePath } from '@backend/shared/utils'
import { Alert } from 'antd'
import { createContext, useContext, useContextSelector } from 'use-context-selector'

export namespace AdminCtx {
  export type Admin = { id: string; name: string; email: string }
  export type Me = { admin: Admin | null }
  // export type AppConfig = BackendTrpcRouter.Output['getAppConfig']['appConfig']
  export type AppConfig = null
  export type Ctx = {
    me: Me
    appConfig: AppConfig
    env: Env
    openapiSchema: OpenapiSchema
  }

  const ReactContext = createContext<Ctx>(null as never)

  export const Provider = ({ children }: { children: React.ReactNode }) => {
    // const getAppConfigQr = useQuery(
    //   trpc.getAppConfig.queryOptions(undefined, {
    //     staleTime: Infinity,
    //   }),
    // )
    const envParseResult = ((): { env: Env; error: null } | { env: null; error: unknown } => {
      try {
        return { env: createEnv(import.meta.env), error: null }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        return { error, env: null }
      }
    })()
    const openapiSchemaResult = useOpenapiSchemaLoader({
      url: `${import.meta.env.VITE_BACKEND_URL}${backendAdminRoutesBasePath}/doc.json`,
    })
    if (envParseResult.error || !envParseResult.env) {
      return (
        <Alert
          type="error"
          message={envParseResult.error instanceof Error ? envParseResult.error.message : 'Unknown error'}
        />
      )
    }
    const error = openapiSchemaResult.error
    const pending = openapiSchemaResult.isLoading
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
      appConfig: null, // getAppConfigQr.data?.appConfig,
      env: envParseResult.env,
      openapiSchema: openapiSchemaResult.schema,
    }
    return <ReactContext.Provider value={adminCtx as Ctx}>{children}</ReactContext.Provider>
  }

  export const useCtx = () => {
    return useContext(ReactContext)
  }
  export const useMe = () => useContextSelector(ReactContext, (ctx) => ctx.me)
  export const useAppConfig = () => useContextSelector(ReactContext, (ctx) => ctx.appConfig)
  export const useEnv = () => useContextSelector(ReactContext, (ctx) => ctx.env)
  export const useOpenapiSchema = () => useContextSelector(ReactContext, (ctx) => ctx.openapiSchema)
}
