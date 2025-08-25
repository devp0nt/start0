import { Error0 } from "@shmoject/modules/lib/error0"
import { getQueryClient } from "@shmoject/site/lib/trpc"
import {
  type DehydratedState,
  dehydrate,
  type QueryClient,
} from "@tanstack/react-query"
import { useMemo } from "react"
import {
  type LoaderFunctionArgs,
  useLoaderData as useLoaderDataOriginal,
} from "react-router"

export const createLoader0 = <TOutput>(
  fn: (props: LoaderArgs0<any>) => Promise<TOutput>,
) => {
  return async (loaderArgs: LoaderFunctionArgs) => {
    const qc = getQueryClient()
    try {
      const data = await fn({ ...loaderArgs, qc })
      const dehydratedState = dehydrate(qc)
      return {
        error: null,
        error0: null,
        data,
        dehydratedState,
      }
    } catch (error) {
      const dehydratedState = dehydrate(qc)
      return {
        error,
        error0: Error0.toJSON(error),
        data: null,
        dehydratedState,
      }
    }
  }
}

export type LoaderArgs0<TLoaderArgs> = TLoaderArgs & {
  qc: QueryClient
}

export type LoaderResult0<TOutput> =
  | {
      data: TOutput
      error: null
      error0: null
      dehydratedState: DehydratedState
    }
  | {
      data: null
      error: unknown
      error0: Error0.JSON
      dehydratedState: DehydratedState
    }

export type LoaderResultClear0<TOutput> =
  | {
      data: TOutput
      error: null
      error0: null
    }
  | {
      data: null
      error: unknown
      error0: Error0.JSON
    }

export type LoaderResultByLoader0<TLoader extends (...args: any) => any> =
  Awaited<ReturnType<TLoader>>

export type SuccessLoaderResultByLoader0<
  TLoader extends (...args: any) => any,
> = Extract<LoaderResultByLoader0<TLoader>, { error: null }>

export type FailLoaderResultByLoader0<TLoader extends (...args: any) => any> =
  Extract<LoaderResultByLoader0<TLoader>, { data: null }>

export type LoaderResultClearSuccessByLoader0<
  TLoader extends (...args: any) => any,
> = Omit<SuccessLoaderResultByLoader0<TLoader>, "dehydratedState">

export type LoaderResultClearFailByLoader0<
  TLoader extends (...args: any) => any,
> = Omit<FailLoaderResultByLoader0<TLoader>, "dehydratedState">

export type LoaderResultClearByLoader0<TLoader extends (...args: any) => any> =
  | LoaderResultClearSuccessByLoader0<TLoader>
  | LoaderResultClearFailByLoader0<TLoader>

export const useClearLoaderData0 = <
  TLoader extends (...args: any) => any,
>(): LoaderResultClearByLoader0<TLoader> => {
  const data = useLoaderDataOriginal()
  return useMemo(() => {
    const { dehydratedState: _dehydratedState, ...dataFromLoader } = data
    return dataFromLoader
  }, [data])
}

// export const withSuccessLoaderDataOrPageComponent = <
//   TLoader extends (...args: any) => any,
// >((props: { loaderData: SuccessLoaderResultByLoader0<TLoader> }) => {
//   const { loaderData } = props
//   return <PageComponent loaderData={loaderData} />
// }
