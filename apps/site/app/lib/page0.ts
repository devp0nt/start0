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

  export type LoaderData = Record<string, any>
  type DefaultLoaderData = {}

  // ---- utility: conditionally optional props ----
  type WithParams<P> = { params: P }
  type WithLoaderData<D> = { loaderData: D }

  // ---- core signatures (accept params/loaderData optionally if undefined) ----
  export type Loader<TRouteParams, TLoaderData extends LoaderData> = (
    props: WithParams<TRouteParams> & {
      qc: QueryClient
      ctx: Ctx
    },
  ) => Promise<TLoaderData>

  export type Component<TRouteParams, TLoaderData extends LoaderData> = (
    props: WithParams<TRouteParams> &
      WithLoaderData<TLoaderData> & {
        ctx: Ctx
      },
  ) => React.ReactNode

  export type TitleFn<TRouteParams, TLoaderData extends LoaderData> = (
    props: WithParams<TRouteParams> &
      WithLoaderData<TLoaderData> & {
        ctx: Ctx
      },
  ) => string

  export type Title<TRouteParams, TLoaderData extends LoaderData> =
    | TitleFn<TRouteParams, TLoaderData>
    | string

  export type Meta<TRouteParams, TLoaderData extends LoaderData> = (
    props: WithParams<TRouteParams> &
      WithLoaderData<TLoaderData> & {
        ctx: Ctx
      },
  ) => MetaDescriptor[]

  export type Page<
    TRoute extends Route = Route,
    TRouteParams = RouteParams<TRoute>,
    TData extends LoaderData = LoaderData,
  > = {
    route: TRoute
    loader: Loader<TRouteParams, TData>
    meta?: Meta<TRouteParams, TData>
    Component: Component<TRouteParams, TData>
  }

  // Builder
  export const route = <TRoute extends Route>(routeDefinition: TRoute) => {
    type TRouteParams = RouteParams<TRoute>

    return {
      component: (
        componentDefinition: Component<TRouteParams, DefaultLoaderData>,
      ) => {
        const defaultLoader: Loader<
          TRouteParams,
          DefaultLoaderData
        > = async () => ({})
        return {
          route: routeDefinition,
          loader: defaultLoader,
          meta: undefined,
          Component: componentDefinition,
        }
      },

      meta: (metaDefinition: Meta<TRouteParams, DefaultLoaderData>) => {
        return {
          component: (
            componentDefinition: Component<TRouteParams, DefaultLoaderData>,
          ) => {
            const defaultLoader: Loader<
              TRouteParams,
              DefaultLoaderData
            > = async () => ({})
            return {
              route: routeDefinition,
              loader: defaultLoader,
              meta: metaDefinition,
              Component: componentDefinition,
            }
          },
        }
      },

      title: (titleDefinition: Title<TRouteParams, DefaultLoaderData>) => {
        return {
          component: (
            componentDefinition: Component<TRouteParams, DefaultLoaderData>,
          ) => {
            const metaDefinition: Meta<TRouteParams, DefaultLoaderData> = (
              props,
            ) => [
              {
                title:
                  typeof titleDefinition === "string"
                    ? titleDefinition
                    : titleDefinition(props),
              },
            ]
            const defaultLoader: Loader<
              TRouteParams,
              DefaultLoaderData
            > = async () => ({})
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
        loaderDefinition: Loader<TRouteParams, TLoaderData>,
      ) => {
        return {
          component: (
            componentDefinition: Component<TRouteParams, TLoaderData>,
          ) => {
            return {
              route: routeDefinition,
              loader: loaderDefinition,
              meta: undefined,
              Component: componentDefinition,
            }
          },

          meta: (metaDefinition: Meta<TRouteParams, TLoaderData>) => {
            return {
              component: (
                componentDefinition: Component<TRouteParams, TLoaderData>,
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

          title: (titleDefinition: Title<TRouteParams, TLoaderData>) => {
            return {
              component: (
                componentDefinition: Component<TRouteParams, TLoaderData>,
              ) => {
                const metaDefinition: Meta<TRouteParams, TLoaderData> = (
                  props,
                ) => [
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
