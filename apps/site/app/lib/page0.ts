import type { Route0 } from "@shmoject/modules/lib/route0.sh"
import type { SiteCtx } from "@shmoject/site/lib/ctx"
import type { QueryClient } from "@tanstack/react-query"
import type { MetaDescriptor } from "react-router"

export namespace Page0 {
  type Ctx = SiteCtx.Ctx

  // Any Route0 instance is acceptable; we’ll keep TRoute precise where it’s used.
  export type Route = Route0<any, any, any, any>

  // Derive params type from a specific route
  export type RouteParams<TRoute extends Route = Route> =
    Route0.ExtractParamsOutput<TRoute>

  export type RouteQuery<TRoute extends Route = Route> =
    Route0.ExtractQueryOutput<TRoute>

  export type LoaderData = Record<string, any>
  type DefaultLoaderData = {}

  // ---- utility: conditionally optional props ----
  type WithParams<P> = { params: P }
  type WithQuery<S> = { query: S }
  type WithLoaderData<D> = { loaderData: D }

  // ---- core signatures ----
  export type Loader<
    TRouteParams,
    TRouteSearch = unknown,
    TLoaderData extends LoaderData = LoaderData,
  > = (
    props: WithParams<TRouteParams> &
      WithQuery<TRouteSearch> & {
        qc: QueryClient
        ctx: Ctx
      },
  ) => Promise<TLoaderData>

  export type Component<
    TRouteParams,
    TRouteSearch = unknown,
    TLoaderData extends LoaderData = LoaderData,
  > = (
    props: WithParams<TRouteParams> &
      WithQuery<TRouteSearch> &
      WithLoaderData<TLoaderData> & {
        ctx: Ctx
      },
  ) => React.ReactNode

  export type TitleFn<
    TRouteParams,
    TRouteSearch = unknown,
    TLoaderData extends LoaderData = LoaderData,
  > = (
    props: WithParams<TRouteParams> &
      WithQuery<TRouteSearch> &
      WithLoaderData<TLoaderData> & {
        ctx: Ctx
      },
  ) => string

  export type Title<
    TRouteParams,
    TRouteSearch = unknown,
    TLoaderData extends LoaderData = LoaderData,
  > = TitleFn<TRouteParams, TRouteSearch, TLoaderData> | string

  export type Meta<
    TRouteParams,
    TRouteSearch = unknown,
    TLoaderData extends LoaderData = LoaderData,
  > = (
    props: WithParams<TRouteParams> &
      WithQuery<TRouteSearch> &
      WithLoaderData<TLoaderData> & {
        ctx: Ctx
      },
  ) => MetaDescriptor[]

  export type Page<
    TRoute extends Route = Route,
    TRouteParams = RouteParams<TRoute>,
    TRouteSearch = RouteQuery<TRoute>,
    TData extends LoaderData = LoaderData,
  > = {
    route: TRoute
    loader: Loader<TRouteParams, TRouteSearch, TData>
    meta?: Meta<TRouteParams, TRouteSearch, TData>
    Component: Component<TRouteParams, TRouteSearch, TData>
  }

  // Builder
  export const route = <TRoute extends Route>(routeDefinition: TRoute) => {
    type TRouteParams = RouteParams<TRoute>
    type TRouteSearch = RouteQuery<TRoute>

    return {
      component: (
        componentDefinition: Component<
          TRouteParams,
          TRouteSearch,
          DefaultLoaderData
        >,
      ) => {
        const defaultLoader: Loader<
          TRouteParams,
          TRouteSearch,
          DefaultLoaderData
        > = async (_props) => ({})
        return {
          route: routeDefinition,
          loader: defaultLoader,
          meta: undefined,
          Component: componentDefinition,
        }
      },

      meta: (
        metaDefinition: Meta<TRouteParams, TRouteSearch, DefaultLoaderData>,
      ) => {
        return {
          component: (
            componentDefinition: Component<
              TRouteParams,
              TRouteSearch,
              DefaultLoaderData
            >,
          ) => {
            const defaultLoader: Loader<
              TRouteParams,
              TRouteSearch,
              DefaultLoaderData
            > = async (_props) => ({})
            return {
              route: routeDefinition,
              loader: defaultLoader,
              meta: metaDefinition,
              Component: componentDefinition,
            }
          },
        }
      },

      title: (
        titleDefinition: Title<TRouteParams, TRouteSearch, DefaultLoaderData>,
      ) => {
        return {
          component: (
            componentDefinition: Component<
              TRouteParams,
              TRouteSearch,
              DefaultLoaderData
            >,
          ) => {
            const metaDefinition: Meta<
              TRouteParams,
              TRouteSearch,
              DefaultLoaderData
            > = (props) => [
              {
                title:
                  typeof titleDefinition === "string"
                    ? titleDefinition
                    : titleDefinition(props),
              },
            ]
            const defaultLoader: Loader<
              TRouteParams,
              TRouteSearch,
              DefaultLoaderData
            > = async (_props) => ({})
            return {
              route: routeDefinition,
              loader: defaultLoader,
              meta: metaDefinition,
              Component: componentDefinition,
            }
          },
        }
      },

      loader: <TLoaderData extends LoaderData>(
        loaderDefinition: Loader<TRouteParams, TRouteSearch, TLoaderData>,
      ) => {
        return {
          component: (
            componentDefinition: Component<
              TRouteParams,
              TRouteSearch,
              TLoaderData
            >,
          ) => {
            return {
              route: routeDefinition,
              loader: loaderDefinition,
              meta: undefined,
              Component: componentDefinition,
            }
          },

          meta: (
            metaDefinition: Meta<TRouteParams, TRouteSearch, TLoaderData>,
          ) => {
            return {
              component: (
                componentDefinition: Component<
                  TRouteParams,
                  TRouteSearch,
                  TLoaderData
                >,
              ) => {
                return {
                  route: routeDefinition,
                  loader: loaderDefinition,
                  meta: metaDefinition,
                  Component: componentDefinition,
                }
              },
            }
          },

          title: (
            titleDefinition: Title<TRouteParams, TRouteSearch, TLoaderData>,
          ) => {
            return {
              component: (
                componentDefinition: Component<
                  TRouteParams,
                  TRouteSearch,
                  TLoaderData
                >,
              ) => {
                const metaDefinition: Meta<
                  TRouteParams,
                  TRouteSearch,
                  TLoaderData
                > = (props) => [
                  {
                    title:
                      typeof titleDefinition === "string"
                        ? titleDefinition
                        : titleDefinition(props),
                  },
                ]
                return {
                  route: routeDefinition,
                  loader: loaderDefinition,
                  meta: metaDefinition,
                  Component: componentDefinition,
                }
              },
            }
          },
        }
      },
    }
  }
}
