import { ErrorPage } from '@cross/base/components/error'
import { Loader } from '@cross/base/components/loader'
import { trpc } from '@trpc/client-base'
import { authClient } from '@auth/client-base/utils'
import type { Session } from '@auth/backend/utils'
import type { AdminClientMe, CustomerClientMe, UserClientMe } from '@auth/shared/user'
import type { TrpcRouterOutput } from '@trpc/router'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useContextSelector } from 'use-context-selector'

export type AppConfig = TrpcRouterOutput['app']['getConfig']['config']
export type AdminCtx = {
  session: Session | null
  user: UserClientMe | null
  admin: AdminClientMe | null
  customer: CustomerClientMe | null
  config: AppConfig
}

const ReactContext = createContext<AdminCtx>(null as never)

export const CtxProvider = ({ children }: { children: React.ReactNode }) => {
  const getConfigResult = useQuery(trpc.app.getConfig.queryOptions())
  const sessionResult = authClient.useSession()
  const pending = getConfigResult.isLoading || sessionResult.isPending
  const error = getConfigResult.error || sessionResult.error

  if (pending) {
    return <Loader type="site" />
  }
  if (error) {
    return <ErrorPage error={error} />
  }

  const config = getConfigResult.data?.config
  if (!config) {
    return <ErrorPage message="Config not found" />
  }

  const session = sessionResult.data?.session || null
  const user = sessionResult.data?.user || null
  const admin = sessionResult.data?.admin || null
  const customer = sessionResult.data?.customer || null

  return (
    <ReactContext.Provider
      value={{
        session,
        user,
        admin,
        customer,
        config,
      }}
    >
      {children}
    </ReactContext.Provider>
  )
}

export const useCtx = () => {
  return useContext(ReactContext)
}
export const useMeAdmin = () => useContextSelector(ReactContext, (ctx) => ctx.admin)
export const useMeCustomer = () => useContextSelector(ReactContext, (ctx) => ctx.customer)
export const useConfig = () => useContextSelector(ReactContext, (ctx) => ctx.config)
