import { Error0 } from "@shmoject/modules/lib/error0.sh"
import { SiteCtx } from "@shmoject/site/lib/ctx"
import { getQueryClient } from "@shmoject/site/lib/trpc"
import {
  type DehydratedState,
  dehydrate,
  hydrate,
  type QueryClient,
} from "@tanstack/react-query"
import merge from "deepmerge"
import { type LoaderFunctionArgs, useMatches } from "react-router"

export namespace RR0 {
  export const createLoader = <TOutput>(
    fn: (props: LoaderArgs<any>) => Promise<TOutput>,
  ) => {
    return async (loaderArgs: LoaderFunctionArgs) => {
      try {
        const qc = getQueryClient()
        const siteCtxHolder = await SiteCtx.rrGetFromContextOrThrow({
          context: loaderArgs.context,
        })
        hydrate(qc, siteCtxHolder.dehydratedState)
        const data = await fn({ ...loaderArgs, ctx: siteCtxHolder.siteCtx, qc })
        const dehydratedState = dehydrate(qc)
        return {
          data: {
            ...data,
          },
          siteCtx: siteCtxHolder.siteCtx,
          dehydratedState,
        }
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type LoaderArgs<TLoaderArgs> = TLoaderArgs & {
    qc: QueryClient
    ctx: SiteCtx.Ctx
  }

  export const useDehydratedState = (): DehydratedState | undefined => {
    const matches = useMatches()
    const dehydratedState = matches
      .map(
        (match) =>
          (
            match.loaderData as
              | { dehydratedState?: DehydratedState }
              | undefined
          )?.dehydratedState,
      )
      .filter(Boolean) as DehydratedState[]
    return dehydratedState.length
      ? dehydratedState.reduce(
          (accumulator, currentValue) => merge(accumulator, currentValue),
          { mutations: [], queries: [] } as DehydratedState,
        )
      : undefined
  }
}
