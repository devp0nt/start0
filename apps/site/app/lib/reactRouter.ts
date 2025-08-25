import { Error0 } from "@shmoject/modules/lib/error0"
import { getQueryClient } from "@shmoject/site/lib/trpc"
import { dehydrate, type QueryClient } from "@tanstack/react-query"
import type { LoaderFunctionArgs } from "react-router"

export const createLoader0 = <TOutput>(
  fn: (props: LoaderArgs0<any>) => Promise<TOutput>,
) => {
  return async (loaderArgs: LoaderFunctionArgs) => {
    const qc = getQueryClient()
    try {
      const data = await fn({ ...loaderArgs, qc })
      const dehydratedState = dehydrate(qc)
      return {
        data,
        dehydratedState,
      }
    } catch (error) {
      const error0 = Error0.from(error)
      throw Response.json(error0.toJSON(), {
        status: error0.httpStatus,
        statusText: error0.message,
      })
    }
  }
}

export type LoaderArgs0<TLoaderArgs> = TLoaderArgs & {
  qc: QueryClient
}
