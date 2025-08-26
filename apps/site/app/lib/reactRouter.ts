import { Error0 } from "@shmoject/modules/lib/error0"
import { SiteCtx } from "@shmoject/site/lib/ctx"
import { getQueryClient } from "@shmoject/site/lib/trpc"
import { dehydrate, type QueryClient } from "@tanstack/react-query"
import type { LoaderFunctionArgs } from "react-router"

export namespace ReactRouter0 {
  export const createLoader = <TOutput>(
    fn: (props: LoaderArgs<any>) => Promise<TOutput>,
  ) => {
    return async (loaderArgs: LoaderFunctionArgs) => {
      const qc = getQueryClient()
      try {
        const { ctx } = await SiteCtx.loader({ qc })
        const data = await fn({ ...loaderArgs, ctx, qc })
        const dehydratedState = dehydrate(qc)
        return {
          data: {
            ...data,
          },
          ctx,
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

  export type LoaderArgs<TLoaderArgs> = TLoaderArgs & {
    qc: QueryClient
    ctx: SiteCtx.Ctx
  }
}
