import type { Route0 } from "@shmoject/modules/lib/route0.sh"
import type { SiteCtx } from "@shmoject/site/lib/ctx"
import type { QueryClient } from "@tanstack/react-query"
import type { MetaDescriptor } from "react-router"

// TODO: class
// TODO: test
// TODO: layout0 → route0
// TODO: use in react router

// TODO: ? .create({})
// TODO: metaError, metaLoading
// TODO: titleError, titleLoading
// TODO: title exact or suffix or prefix

export namespace Page0 {
  type Ctx = SiteCtx.Ctx

  // Any Route0 instance is acceptable; we’ll keep TRoute precise where it’s used.
  export type Route = Route0<any, any, any, any>

  // Derive params type from a specific route
  export type RouteParams<TRoute extends Route = Route> = Route0.Params<TRoute>

  export type RouteQuery<TRoute extends Route = Route> = Route0.Query<TRoute>

  export type LoaderData = Record<string, any>
  type DefaultLoaderData = {}

  // ---- utility: conditionally optional props ----
  type WithParams<P> = { params: P }
  type WithQuery<S> = { query: S }
  type WithLoaderData<D> = { loaderData: D }

  // ---- core signatures ----
  export type Loader<TRouteParams, TRouteSearch = unknown, TLoaderData extends LoaderData = LoaderData> = (
    props: WithParams<TRouteParams> &
      WithQuery<TRouteSearch> & {
        qc: QueryClient
        ctx: Ctx
      },
  ) => Promise<TLoaderData>

  export type Component<TRouteParams, TRouteSearch = unknown, TLoaderData extends LoaderData = LoaderData> = (
    props: WithParams<TRouteParams> &
      WithQuery<TRouteSearch> &
      WithLoaderData<TLoaderData> & {
        ctx: Ctx
      },
  ) => React.ReactNode

  export type TitleFn<TRouteParams, TRouteSearch = unknown, TLoaderData extends LoaderData = LoaderData> = (
    props: WithParams<TRouteParams> &
      WithQuery<TRouteSearch> &
      WithLoaderData<TLoaderData> & {
        ctx: Ctx
      },
  ) => string

  export type Title<TRouteParams, TRouteSearch = unknown, TLoaderData extends LoaderData = LoaderData> =
    | TitleFn<TRouteParams, TRouteSearch, TLoaderData>
    | string

  export type Meta<TRouteParams, TRouteSearch = unknown, TLoaderData extends LoaderData = LoaderData> = (
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

  // ---- helpers to reduce duplication ----
  const createDefaultLoader = <
    TRouteParams,
    TRouteSearch = unknown,
    TLoaderData extends LoaderData = DefaultLoaderData,
  >(): Loader<TRouteParams, TRouteSearch, TLoaderData> => {
    return (async (_props) => ({}) as TLoaderData) as Loader<TRouteParams, TRouteSearch, TLoaderData>
  }

  const titleToMeta = <TRouteParams, TRouteSearch = unknown, TLoaderData extends LoaderData = LoaderData>(
    titleDefinition: Title<TRouteParams, TRouteSearch, TLoaderData>,
  ): Meta<TRouteParams, TRouteSearch, TLoaderData> => {
    return (props) => [
      {
        title: typeof titleDefinition === "string" ? titleDefinition : titleDefinition(props),
      },
    ]
  }

  const extendMetaWithTitle = <TRouteParams, TRouteSearch = unknown, TLoaderData extends LoaderData = LoaderData>(
    baseMeta: Meta<TRouteParams, TRouteSearch, TLoaderData>,
    titleDefinition: Title<TRouteParams, TRouteSearch, TLoaderData>,
  ): Meta<TRouteParams, TRouteSearch, TLoaderData> => {
    const titleMeta = titleToMeta<TRouteParams, TRouteSearch, TLoaderData>(titleDefinition)
    return (props) => [...baseMeta(props), ...titleMeta(props)]
  }

  // Builder
  export const route = <TRoute extends Route>(routeDefinition: TRoute) => {
    type TRouteParams = RouteParams<TRoute>
    type TRouteSearch = RouteQuery<TRoute>

    return {
      component: (componentDefinition: Component<TRouteParams, TRouteSearch, DefaultLoaderData>) => {
        const defaultLoader = createDefaultLoader<TRouteParams, TRouteSearch, DefaultLoaderData>()
        return {
          route: routeDefinition,
          loader: defaultLoader,
          meta: undefined,
          Component: componentDefinition,
        }
      },

      meta: (metaDefinition: Meta<TRouteParams, TRouteSearch, DefaultLoaderData>) => {
        return {
          component: (componentDefinition: Component<TRouteParams, TRouteSearch, DefaultLoaderData>) => {
            const defaultLoader = createDefaultLoader<TRouteParams, TRouteSearch, DefaultLoaderData>()
            return {
              route: routeDefinition,
              loader: defaultLoader,
              meta: metaDefinition,
              Component: componentDefinition,
            }
          },
        }
      },

      title: (titleDefinition: Title<TRouteParams, TRouteSearch, DefaultLoaderData>) => {
        return {
          meta: (metaDefinition: Meta<TRouteParams, TRouteSearch, DefaultLoaderData>) => {
            return {
              component: (componentDefinition: Component<TRouteParams, TRouteSearch, DefaultLoaderData>) => {
                const metaCombined = extendMetaWithTitle<TRouteParams, TRouteSearch, DefaultLoaderData>(
                  metaDefinition,
                  titleDefinition,
                )
                const defaultLoader = createDefaultLoader<TRouteParams, TRouteSearch, DefaultLoaderData>()
                return {
                  route: routeDefinition,
                  loader: defaultLoader,
                  meta: metaCombined,
                  Component: componentDefinition,
                }
              },
            }
          },
          component: (componentDefinition: Component<TRouteParams, TRouteSearch, DefaultLoaderData>) => {
            const metaDefinition = titleToMeta<TRouteParams, TRouteSearch, DefaultLoaderData>(titleDefinition)
            const defaultLoader = createDefaultLoader<TRouteParams, TRouteSearch, DefaultLoaderData>()
            return {
              route: routeDefinition,
              loader: defaultLoader,
              meta: metaDefinition,
              Component: componentDefinition,
            }
          },
        }
      },

      loader: <TLoaderData extends LoaderData>(loaderDefinition: Loader<TRouteParams, TRouteSearch, TLoaderData>) => {
        return {
          component: (componentDefinition: Component<TRouteParams, TRouteSearch, TLoaderData>) => {
            return {
              route: routeDefinition,
              loader: loaderDefinition,
              meta: undefined,
              Component: componentDefinition,
            }
          },

          meta: (metaDefinition: Meta<TRouteParams, TRouteSearch, TLoaderData>) => {
            return {
              component: (componentDefinition: Component<TRouteParams, TRouteSearch, TLoaderData>) => {
                return {
                  route: routeDefinition,
                  loader: loaderDefinition,
                  meta: metaDefinition,
                  Component: componentDefinition,
                }
              },
            }
          },

          title: (titleDefinition: Title<TRouteParams, TRouteSearch, TLoaderData>) => {
            return {
              meta: (metaDefinition: Meta<TRouteParams, TRouteSearch, TLoaderData>) => {
                return {
                  component: (componentDefinition: Component<TRouteParams, TRouteSearch, TLoaderData>) => {
                    const metaCombined = extendMetaWithTitle<TRouteParams, TRouteSearch, TLoaderData>(
                      metaDefinition,
                      titleDefinition,
                    )
                    return {
                      route: routeDefinition,
                      loader: loaderDefinition,
                      meta: metaCombined,
                      Component: componentDefinition,
                    }
                  },
                }
              },
              component: (componentDefinition: Component<TRouteParams, TRouteSearch, TLoaderData>) => {
                const metaDefinition = titleToMeta<TRouteParams, TRouteSearch, TLoaderData>(titleDefinition)
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
