import { Error0 } from "@shmoject/modules/lib/error0.sh"
import type { ToUndefinedIfExactlyEmpty } from "@shmoject/modules/lib/lodash0.sh"
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
        const data = await fn({
          ...loaderArgs,
          ctx: siteCtxHolder.siteCtx,
          qc,
          params:
            Object.keys(loaderArgs.params).length > 0
              ? (loaderArgs.params as any)
              : undefined,
        })
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

  export type LoaderArgs<TLoaderArgs extends { params: any }> = Omit<
    TLoaderArgs,
    "params"
  > & {
    qc: QueryClient
    ctx: SiteCtx.Ctx
    params: ToUndefinedIfExactlyEmpty<TLoaderArgs["params"]>
  }

  export const createMeta = <TOutput>(fn: (props: any) => TOutput) => {
    return (metaArgs: any) => {
      try {
        return fn({
          ...metaArgs,
          params:
            Object.keys(metaArgs.params).length > 0
              ? metaArgs.params
              : undefined,
        })
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type MetaArgs<TMetaArgsRR extends { params: any }> = Omit<
    TMetaArgsRR,
    "params"
  > & {
    params: ToUndefinedIfExactlyEmpty<TMetaArgsRR["params"]>
  }

  export const createRouteComponent = <TOutput>(
    fn: (props: any) => TOutput,
  ) => {
    return async (componentArgs: any) => {
      try {
        return fn({
          ...componentArgs,
          params:
            Object.keys(componentArgs.params).length > 0
              ? componentArgs.params
              : undefined,
        })
      } catch (error) {
        throw Error0.from(error).toResponse()
      }
    }
  }

  export type RouteComponentArgs<TRouteComponentArgs extends { params: any }> =
    Omit<TRouteComponentArgs, "params"> & {
      params: ToUndefinedIfExactlyEmpty<TRouteComponentArgs["params"]>
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
