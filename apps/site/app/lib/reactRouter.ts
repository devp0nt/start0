import { getQueryClient } from "@shmoject/site/lib/trpc"
import { dehydrate, type QueryClient } from "@tanstack/react-query"
import type { LoaderFunctionArgs } from "react-router"

export const createLoader = <TInput extends LoaderFunctionArgs, TOutput>(
  fn: (input: TInput & { qc: QueryClient }) => Promise<TOutput>,
) => {
  return async (loaderArgs: TInput) => {
    const qc = getQueryClient()
    const data = await fn({ ...loaderArgs, qc })
    const dehydratedState = dehydrate(qc)
    return { ...data, dehydratedState }
  }
}
