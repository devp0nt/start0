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
    fn: (props: any) => Promise<TOutput>,
  ) => {
    return async (loaderArgs: LoaderFunctionArgs) => {
      try {
        const qc = getQueryClient()
        const siteCtxHolder = await SiteCtx.rrGetFromContextOrThrow({
          context: loaderArgs.context,
        })
        hydrate(qc, siteCtxHolder.dehydratedState)
        const url = new URL(loaderArgs.request.url)
        const query = Object.fromEntries(url.searchParams.entries())
        const data = await fn({
          ...loaderArgs,
          query,
          ctx: siteCtxHolder.siteCtx,
          qc,
        })
        const dehydratedState = dehydrate(qc)
        return {
          data: {
            ...data,
          },
          query,
          siteCtx: siteCtxHolder.siteCtx,
          dehydratedState,
        }
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type LoaderArgs<TLoaderArgs> = TLoaderArgs & {
    query: Record<string, string>
    qc: QueryClient
    ctx: SiteCtx.Ctx
  }

  export const createMeta = <TOutput>(fn: (props: any) => TOutput) => {
    return (metaArgs: any) => {
      try {
        return fn({
          ...metaArgs,
          query: metaArgs.loaderData?.query || {},
        })
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type MetaArgs<TMetaArgsRR> = TMetaArgsRR & {
    query: Record<string, string>
  }

  export const createRouteComponent = <TOutput>(
    fn: (props: any) => TOutput,
  ) => {
    return async (componentArgs: any) => {
      try {
        return fn({
          ...componentArgs,
          query: componentArgs.loaderData?.query || {},
        })
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type RouteComponentArgs<TRouteComponentArgs> = TRouteComponentArgs & {
    query: Record<string, string>
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
