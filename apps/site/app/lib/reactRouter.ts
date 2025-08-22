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

export const createLoader = <TOutput>(
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

export type LoaderResultByLoader0<TLoader extends (...args: any) => any> =
  Extract<Awaited<ReturnType<TLoader>>, { error: null }>

export const useLoaderData0 = <
  TLoader extends (...args: any) => any,
>(): LoaderResultByLoader0<TLoader> => {
  const data = useLoaderDataOriginal()
  return useMemo(() => {
    const { dehydratedState: _dehydratedState, ...dataFromLoader } = data
    return dataFromLoader
  }, [data])
}
