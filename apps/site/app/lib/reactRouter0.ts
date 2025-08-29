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
        const search = Object.fromEntries(url.searchParams.entries())
        const data = await fn({
          ...loaderArgs,
          search,
          ctx: siteCtxHolder.siteCtx,
          qc,
        })
        const dehydratedState = dehydrate(qc)
        return {
          data: {
            ...data,
          },
          search,
          siteCtx: siteCtxHolder.siteCtx,
          dehydratedState,
        }
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type LoaderArgs<TLoaderArgs> = TLoaderArgs & {
    search: Record<string, string>
    qc: QueryClient
    ctx: SiteCtx.Ctx
  }

  export const createMeta = <TOutput>(fn: (props: any) => TOutput) => {
    return (metaArgs: any) => {
      try {
        return fn({
          ...metaArgs,
          search: metaArgs.loaderData?.search || {},
        })
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type MetaArgs<TMetaArgsRR> = TMetaArgsRR & {
    search: Record<string, string>
  }

  export const createRouteComponent = <TOutput>(
    fn: (props: any) => TOutput,
  ) => {
    return async (componentArgs: any) => {
      try {
        return fn({
          ...componentArgs,
          search: componentArgs.loaderData?.search || {},
        })
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type RouteComponentArgs<TRouteComponentArgs> = TRouteComponentArgs & {
    search: Record<string, string>
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
