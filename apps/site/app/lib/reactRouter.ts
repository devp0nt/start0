import { getQueryClient } from "@shmoject/site/lib/trpc"
import { dehydrate, type QueryClient } from "@tanstack/react-query"
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
    const data = await fn({ ...loaderArgs, qc })
    const dehydratedState = dehydrate(qc)
    return { ...data, dehydratedState }
  }
}

export type LoaderArgs0<TLoaderArgs> = TLoaderArgs & {
  qc: QueryClient
}

export const useLoaderData0 = <T>(): T => {
  const data = useLoaderDataOriginal()
  return useMemo(() => {
    const { dehydratedState: _dehydratedState, ...dataFromLoader } = data
    return dataFromLoader
  }, [data])
}
