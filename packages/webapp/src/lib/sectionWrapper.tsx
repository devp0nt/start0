import type { AppContext } from '@/webapp/src/lib/ctx.js'
import { useAppContext } from '@/webapp/src/lib/ctx.js'
import type { UseTRPCQueryResult, UseTRPCQuerySuccessResult } from '@trpc/react-query/shared'
import React from 'react'

type Props = Record<string, any>
type FinalProps<
  TForwardedProps extends Props = {},
  TProps extends Props = {},
  TData extends UseDataResult | undefined = {},
  TQueryResult extends QueryResult | undefined = QueryResult,
  TQueriesResults extends QueriesResults | undefined = QueriesResults,
> = HelperProps<TForwardedProps, TData, TQueryResult, TQueriesResults> & TProps & TForwardedProps
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
  TForwardedProps extends Props,
  TData extends UseDataResult | undefined,
  TQueryResult extends QueryResult | undefined,
  TQueriesResults extends QueriesResults | undefined,
> = {
  forwardedProps: TForwardedProps
  ctx: AppContext
  data: TData extends UseDataResult ? UseDataSuccessResult<TData> : undefined
  queryResult: TQueryResult extends QueryResult ? QuerySuccessResult<TQueryResult> : undefined
  queriesResults: TQueriesResults extends QueriesResults ? QueriesSuccessResults<TQueriesResults> : undefined
}
type SetPropsProps<
  TForwardedProps extends Props,
  TData extends UseDataResult | undefined,
  TQueryResult extends QueryResult | undefined,
  TQueriesResults extends QueriesResults | undefined,
> = HelperProps<TForwardedProps, TData, TQueryResult, TQueriesResults> & TForwardedProps
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
type SectionWrapperProps<
  TForwardedProps extends Props,
  TProps extends Props,
  TData extends UseDataResult,
  TQueryResult extends QueryResult | undefined,
  TQueriesResults extends QueriesResults | undefined,
> = {
  showLoaderOnFetching?: boolean

  forwardProps?: (forwardedProps: TForwardedProps) => TForwardedProps
  useData?: () => TData
  useQuery?: () => TQueryResult
  useQueries?: () => TQueriesResults
  setProps?: (setPropsProps: SetPropsProps<TForwardedProps, TData, TQueryResult, TQueriesResults>) => TProps

  children: React.FC<FinalProps<TForwardedProps, TProps, TData, TQueryResult, TQueriesResults>>
}

export const SectionWrapper = <
  TForwardedProps extends Props = Props,
  TProps extends Props = Props,
  TData extends UseDataResult = UseDataResult,
  TQueryResult extends QueryResult | undefined = undefined,
  TQueriesResults extends QueriesResults | undefined = undefined,
>({
  forwardedProps,
  useData,
  useQuery,
  useQueries,
  setProps,
  children,
  showLoaderOnFetching = true,
}: SectionWrapperProps<TForwardedProps, TProps, TData, TQueryResult, TQueriesResults> & {
  forwardedProps?: TForwardedProps
}) => {
  const ctx = useAppContext()

  const data = useData?.()
  const queryResult = useQuery?.()
  const queriesResults = useQueries?.()
  const isQueryLoading = !!queryResult?.isLoading || (showLoaderOnFetching && !!queryResult?.isFetching)
  const isQueriesLoading = !!queriesResults?.some((qr) => !!qr.isLoading || (showLoaderOnFetching && !!qr.isFetching))
  const isLoading = isQueryLoading || isQueriesLoading
  const queryResultError = queryResult?.error || queriesResults?.find((qr) => qr.error)?.error

  if (isLoading) {
    // return <Loader type="section" />
    // TODO
    return <div>Loading...</div>
  }

  if (data && 'dataGetterError' in data) {
    // TODO - Informer
    return <div>{data.dataGetterError.message}</div>
  }

  if (queryResultError) {
    // TODO - Informer
    return <div>{queryResultError.message}</div>
  }

  const helperProps = {
    ctx,
    forwardedProps: forwardedProps as never,
    data: data as never,
    queryResult: queryResult as never,
    queriesResults: queriesResults as never,
  }

  const props = {
    ...forwardedProps,
    ...helperProps,
    ...setProps?.({
      ...(forwardedProps as any),
      ...(helperProps as any),
    }),
  } as never as FinalProps<TForwardedProps, TProps, TData, TQueryResult, TQueriesResults>
  return React.createElement(children, props)
}

export const withSectionWrapper = <
  TForwardedProps extends Props = Props,
  TProps extends Props = Props,
  TData extends UseDataResult = {},
  TQueryResult extends QueryResult | undefined = undefined,
  TQueriesResults extends QueriesResults | undefined = undefined,
>(
  pageWrapperProps?: Omit<
    SectionWrapperProps<TForwardedProps, TProps, TData, TQueryResult, TQueriesResults>,
    'children'
  >
) => {
  return (children: SectionWrapperProps<TForwardedProps, TProps, TData, TQueryResult, TQueriesResults>['children']) => {
    return (forwardedProps: TForwardedProps) => (
      <SectionWrapper {...pageWrapperProps} forwardedProps={forwardedProps} children={children} />
    )
  }
}
