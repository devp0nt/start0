import { getS3UploadUrl } from '@/general/src/upload/utils.shared.js'
import { getAllEnv } from '@/webapp/src/lib/env.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { Suspense } from 'react'

const env = getAllEnv()

const initialAppContext = {
  ready: false,
  env: getAllEnv(),
  getS3UploadUrl: (s3Key: string) => {
    return getS3UploadUrl(env.VITE_S3_URL, s3Key)
  },
  isAuthorized: false,
  me: {
    user: null,
    admin: null,
  },
}

export const AppContextPreloader = ({ children }: { children: React.ReactNode }) => {
  const [getMeQueryResult] = trpc.useQueries((t) => [
    t.getMe(undefined, {
      staleTime: Infinity,
    }),
  ])
  if (!getMeQueryResult.data) {
    return <p>Loading...</p>
  }
  return <Suspense>{children}</Suspense>
}

export const useAppContext = () => {
  const [getMeQueryResult] = trpc.useQueries((t) => [
    t.getMe(undefined, {
      staleTime: Infinity,
    }),
  ])
  const me = getMeQueryResult.data?.me || initialAppContext.me
  return {
    ...initialAppContext,
    me,
    isAuthorized: !!me.user || !!me.admin,
  }
}

export type AppContext = ReturnType<typeof useAppContext>
export type AuthorizedUser = NonNullable<AppContext['me']['user']>
export type AuthorizedUserMe = Omit<AppContext['me'], 'user'> & { user: AuthorizedUser }
export type AuthorizedAdmin = NonNullable<AppContext['me']['admin']>
export type AuthorizedAdminMe = Omit<AppContext['me'], 'admin'> & { admin: AuthorizedAdmin }
