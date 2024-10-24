import { ErroryAccessDenied, ErroryNotFound, ErroryUnauthorized } from '@/general/src/other/errory.js'
import { AccessDeniedPageComponent } from '@/webapp/src/components/errors/AccessDeniedPageComponent/index.js'
import { AuthorizedUsersOnlyPageComponent } from '@/webapp/src/components/errors/AuthorizedUsersOnlyPageComponent/index.js'
import { ErrorBasedPageComponent } from '@/webapp/src/components/errors/ErrorBasedPageComponent/index.js'
import { NotFoundPageComponent } from '@/webapp/src/components/errors/NotFoundPageComponent/index.js'
import type { AppContext, AuthorizedAdminMe, AuthorizedUserMe } from '@/webapp/src/lib/ctx.js'
import { useAppContext } from '@/webapp/src/lib/ctx.js'
import { userDashboardRoute } from '@/webapp/src/lib/routes.js'
import type { UseTRPCQueryResult, UseTRPCQuerySuccessResult } from '@trpc/react-query/shared'
import isBoolean from 'lodash/isBoolean.js'
import { memo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

const checkExistsFn = <T,>(value: T, message?: string): NonNullable<T> => {
  if (!value) {
    throw new ErroryNotFound(message)
  }
  return value
}

const checkAccessFn = (value: any, message?: string): void => {
  if (!value) {
    throw new ErroryAccessDenied(message)
  }
}

type Props = Record<string, any>
type FinalProps<
  TProps extends Props = {},
  TData extends UseDataResult | undefined = {},
  TQueryResult extends QueryResult | undefined = QueryResult,
  TQueriesResults extends QueriesResults | undefined = QueriesResults,
> = HelperProps<TData, TQueryResult, TQueriesResults> & TProps
type UseDataResult = Record<string, any>
type UseDataSuccessResult<TData extends UseDataResult = UseDataResult> = Exclude<TData, { dataGetterError: unknown }>
type QueryResult = UseTRPCQueryResult<any, any>
type QueriesResults = QueryResult[]
type QuerySuccessResult<TQueryResult extends QueryResult = QueryResult> = UseTRPCQuerySuccessResult<
  NonNullable<TQueryResult['data']>,
  null
>
type QueriesSuccessResults<
  TQueriesResults extends QueryResult[],
  TQueryResult1 extends QueryResult | undefined = TQueriesResults[0],
  TQueryResult2 extends QueryResult | undefined = TQueriesResults[1],
  TQueryResult3 extends QueryResult | undefined = TQueriesResults[2],
> = TQueryResult1 extends QueryResult
  ? TQueryResult2 extends QueryResult
    ? TQueryResult3 extends QueryResult
      ? [QuerySuccessResult<TQueryResult1>, QuerySuccessResult<TQueryResult2>, QuerySuccessResult<TQueryResult3>]
      : [QuerySuccessResult<TQueryResult1>, QuerySuccessResult<TQueryResult2>]
    : [QuerySuccessResult<TQueryResult1>]
  : []
type HelperProps<
  TData extends UseDataResult | undefined,
  TQueryResult extends QueryResult | undefined,
  TQueriesResults extends QueriesResults | undefined,
> = {
  ctx: AppContext
  data: TData extends UseDataResult ? UseDataSuccessResult<TData> : undefined
  queryResult: TQueryResult extends QueryResult ? QuerySuccessResult<TQueryResult> : undefined
  queriesResults: TQueriesResults extends QueriesResults ? QueriesSuccessResults<TQueriesResults> : undefined
}
type SetPropsProps<
  TData extends UseDataResult | undefined,
  TQueryResult extends QueryResult | undefined,
  TQueriesResults extends QueriesResults | undefined,
> = HelperProps<TData, TQueryResult, TQueriesResults> & {
  checkExists: typeof checkExistsFn
  checkAccess: typeof checkAccessFn
  getAuthorizedUserMe: (message?: string) => AuthorizedUserMe
  getAuthorizedAdminMe: (message?: string) => AuthorizedAdminMe
}
// type SuccessHelperProps<
//   TProps,
//   TQueryResult extends QueryResult | undefined,
//   TQueriesResults extends QueriesResults | undefined,
// > = {
//   ctx: AppContext
//   queryResult: TQueryResult extends QueryResult ? QuerySuccessResult<TQueryResult> : undefined
//   queriesResults: TQueriesResults extends QueriesResults ? QueriesSuccessResults<TQueriesResults> : undefined
//   props: TProps
// }
type PageWrapperProps<
  TProps extends Props,
  TData extends UseDataResult,
  TQueryResult extends QueryResult | undefined,
  TQueriesResults extends QueriesResults | undefined,
> = {
  redirectAuthorizedUsers?: boolean

  authorizedOnly?: boolean
  authorizedOnlyTitle?: string
  authorizedOnlyMessage?: string

  authorizedUsersOnly?: boolean
  authorizedUsersOnlyTitle?: string
  authorizedUsersOnlyMessage?: string

  activatedUsersOnly?: boolean
  activatedUsersOnlyTitle?: string
  activatedUsersOnlyMessage?: string

  authorizedAdminsOnly?: boolean
  authorizedAdminsOnlyTitle?: string
  authorizedAdminsOnlyMessage?: string

  checkAccess?: (helperProps: HelperProps<TData, TQueryResult, TQueriesResults>) => boolean
  checkAccessTitle?: string
  checkAccessMessage?: string

  checkExists?: (helperProps: HelperProps<TData, TQueryResult, TQueriesResults>) => boolean
  checkExistsTitle?: string
  checkExistsMessage?: string

  title: string | ((helperProps: HelperProps<TData, TQueryResult, TQueriesResults>) => undefined | string)
  isTitleExact?: boolean

  showLoaderOnFetching?: boolean

  useData?: () => TData
  useQuery?: () => TQueryResult
  useQueries?: () => TQueriesResults
  setProps?: (setPropsProps: SetPropsProps<TData, TQueryResult, TQueriesResults>) => TProps

  Page: React.FC<FinalProps<TProps, TData, TQueryResult, TQueriesResults>>
  LayoutError?: React.FC<{ children: React.ReactNode }>
  LayoutSuccess?: React.FC<{ children: React.ReactNode }>
  LayoutLoading?: React.FC<{ children: React.ReactNode }>
  Layout?: React.FC<{ children: React.ReactNode }>
}

const LayoutErrorHere = memo(
  ({
    children,
    LayoutError,
    Layout,
  }: {
    children: React.ReactNode
    LayoutError?: React.FC<{ children: React.ReactNode }>
    Layout?: React.FC<{ children: React.ReactNode }>
  }) => {
    const ParentLayout = LayoutError || Layout
    if (ParentLayout) {
      return <ParentLayout>{children}</ParentLayout>
    }
    return <>{children}</>
  }
)

const LayoutSuccessHere = memo(
  ({
    children,
    LayoutSuccess,
    Layout,
  }: {
    children: React.ReactNode
    LayoutSuccess?: React.FC<{ children: React.ReactNode }>
    Layout?: React.FC<{ children: React.ReactNode }>
  }) => {
    const ParentLayout = LayoutSuccess || Layout
    if (ParentLayout) {
      return <ParentLayout>{children}</ParentLayout>
    }
    return <>{children}</>
  }
)

const LayoutLoadingHere = memo(
  ({
    children,
    LayoutLoading,
    Layout,
  }: {
    children: React.ReactNode
    LayoutLoading?: React.FC<{ children: React.ReactNode }>
    Layout?: React.FC<{ children: React.ReactNode }>
  }) => {
    const ParentLayout = LayoutLoading || Layout
    if (ParentLayout) {
      return <ParentLayout>{children}</ParentLayout>
    }
    return <>{children}</>
  }
)

const PageWrapper = <
  TProps extends Props = Props,
  TData extends UseDataResult = UseDataResult,
  TQueryResult extends QueryResult | undefined = undefined,
  TQueriesResults extends QueriesResults | undefined = undefined,
>({
  authorizedOnly,
  authorizedOnlyTitle,
  authorizedOnlyMessage,
  authorizedUsersOnly,
  authorizedUsersOnlyTitle,
  authorizedUsersOnlyMessage,
  authorizedAdminsOnly,
  authorizedAdminsOnlyTitle,
  authorizedAdminsOnlyMessage,
  activatedUsersOnly,
  redirectAuthorizedUsers,
  checkAccess,
  checkAccessTitle,
  checkAccessMessage,
  checkExists,
  checkExistsTitle,
  checkExistsMessage,
  useData,
  useQuery,
  useQueries,
  setProps,
  Page,
  title,
  isTitleExact = false,
  showLoaderOnFetching = true,
  LayoutError,
  LayoutSuccess,
  LayoutLoading,
  Layout = ({ children }) => <>{children}</>,
}: PageWrapperProps<TProps, TData, TQueryResult, TQueriesResults>) => {
  const ctx = useAppContext()
  const navigate = useNavigate()
  const redirectNeeded = !!redirectAuthorizedUsers && !!ctx.me.user
  const shouldShowAuthorizedOnlyBlocker = !!authorizedOnly && !ctx.isAuthorized
  const authorizedUsersOnlyHere = isBoolean(authorizedUsersOnly) ? authorizedUsersOnly : !!activatedUsersOnly
  const shouldShowAuthorizedUsersOnlyBlocker = authorizedUsersOnlyHere && !ctx.me.user
  const shouldShowAuthorizedAdminsOnlyBlocker = !!authorizedAdminsOnly && !ctx.me.admin

  const data = useData?.()
  const queryResult = useQuery?.()
  const queriesResults = useQueries?.()
  const isQueryLoading = !!queryResult?.isLoading || (showLoaderOnFetching && !!queryResult?.isFetching)
  const isQueriesLoading = !!queriesResults?.some((qr) => !!qr.isLoading || (showLoaderOnFetching && !!qr.isFetching))
  const isLoading = isQueryLoading || isQueriesLoading
  const queryResultError = queryResult?.error || queriesResults?.find((qr) => qr.error)?.error

  useEffect(() => {
    if (redirectNeeded) {
      navigate(userDashboardRoute.get(), { replace: true })
    }
  }, [redirectNeeded])

  if (isLoading || redirectNeeded) {
    // return <Loader type="page" />
    // TODO
    return (
      <LayoutLoadingHere Layout={Layout} LayoutLoading={LayoutLoading}>
        <div>Loading...</div>
      </LayoutLoadingHere>
    )
  }

  if (shouldShowAuthorizedOnlyBlocker) {
    return (
      <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
        <AuthorizedUsersOnlyPageComponent title={authorizedOnlyTitle} message={authorizedOnlyMessage} />
      </LayoutErrorHere>
    )
  }

  if (shouldShowAuthorizedUsersOnlyBlocker) {
    return (
      <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
        <AuthorizedUsersOnlyPageComponent title={authorizedUsersOnlyTitle} message={authorizedUsersOnlyMessage} />
      </LayoutErrorHere>
    )
  }

  if (shouldShowAuthorizedAdminsOnlyBlocker) {
    return (
      <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
        <AuthorizedUsersOnlyPageComponent title={authorizedAdminsOnlyTitle} message={authorizedAdminsOnlyMessage} />
      </LayoutErrorHere>
    )
  }

  if (data && 'dataGetterError' in data) {
    return (
      <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
        <ErrorBasedPageComponent error={data.dataGetterError} />
      </LayoutErrorHere>
    )
  }

  if (queryResultError) {
    return (
      <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
        <ErrorBasedPageComponent error={queryResultError} />
      </LayoutErrorHere>
    )
  }

  const helperProps = {
    ctx,
    data: data as never,
    queryResult: queryResult as never,
    queriesResults: queriesResults as never,
  }

  const calculatedTitle = typeof title === 'function' ? title(helperProps) : title
  const exactTitle = !calculatedTitle ? undefined : isTitleExact ? calculatedTitle : `${calculatedTitle} — Svagatron`

  if (checkAccess) {
    const accessDenied = !checkAccess(helperProps)
    if (accessDenied) {
      return (
        <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
          <AccessDeniedPageComponent title={checkAccessTitle} message={checkAccessMessage} />
        </LayoutErrorHere>
      )
    }
  }

  if (checkExists) {
    const notExists = !checkExists(helperProps)
    if (notExists) {
      return (
        <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
          <NotFoundPageComponent title={checkExistsTitle} message={checkExistsMessage} />
        </LayoutErrorHere>
      )
    }
  }

  const getAuthorizedUserMe = (message?: string) => {
    const user = ctx.me.user
    if (!user) {
      throw new ErroryUnauthorized(message)
    }
    return {
      ...ctx.me,
      user,
    }
  }

  const getAuthorizedAdminMe = (message?: string) => {
    const admin = ctx.me.admin
    if (!admin) {
      throw new ErroryUnauthorized(message)
    }
    return {
      ...ctx.me,
      admin,
    }
  }

  try {
    const props = {
      ...helperProps,
      ...setProps?.({
        ...helperProps,
        checkExists: checkExistsFn,
        checkAccess: checkAccessFn,
        getAuthorizedUserMe,
        getAuthorizedAdminMe,
      }),
    } as never as FinalProps<TProps, TData, TQueryResult, TQueriesResults>
    return (
      <LayoutSuccessHere Layout={Layout} LayoutSuccess={LayoutSuccess}>
        {exactTitle && (
          <Helmet>
            <title>{exactTitle}</title>
          </Helmet>
        )}
        <Page {...props} />
      </LayoutSuccessHere>
    )
  } catch (error) {
    if (error instanceof ErroryNotFound) {
      return (
        <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
          <NotFoundPageComponent title={checkExistsTitle} message={error.message || checkExistsMessage} />
        </LayoutErrorHere>
      )
    }
    if (error instanceof ErroryAccessDenied) {
      return (
        <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
          <AccessDeniedPageComponent title={checkAccessTitle} message={error.message || checkAccessMessage} />
        </LayoutErrorHere>
      )
    }
    if (error instanceof ErroryUnauthorized) {
      return (
        <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
          <AuthorizedUsersOnlyPageComponent
            title={authorizedUsersOnlyTitle}
            message={error.message || authorizedUsersOnlyMessage}
          />
        </LayoutErrorHere>
      )
    }
    return (
      <LayoutErrorHere Layout={Layout} LayoutError={LayoutError}>
        <ErrorBasedPageComponent error={error} />
      </LayoutErrorHere>
    )
  }
}

export const withPageWrapper = <
  TProps extends Props = Props,
  TData extends UseDataResult = {},
  TQueryResult extends QueryResult | undefined = undefined,
  TQueriesResults extends QueriesResults | undefined = undefined,
>(
  pageWrapperProps: Omit<PageWrapperProps<TProps, TData, TQueryResult, TQueriesResults>, 'Page'>
) => {
  return (Page: PageWrapperProps<TProps, TData, TQueryResult, TQueriesResults>['Page']) => {
    return () => <PageWrapper {...pageWrapperProps} Page={Page} />
  }
}
