import type { SiteCtx } from "@shmoject/site/lib/ctx"
import type { QueryClient } from "@tanstack/react-query"
import type { Route as RouteTyped } from "@typed/route"
import type { MetaDescriptor } from "react-router"

// TODO: fix consistent import of pages for fast reloading

export namespace Page0 {
  type Ctx = SiteCtx.Ctx

  export type Route = RouteTyped.Route<any, any>

  export type RouteParams<TRoute extends Route = Route> = Parameters<
    TRoute["interpolate"]
  >[0]

  export type LoaderData = Record<string, any>

  export type Loader<
    TRouteParams extends RouteParams,
    TLoaderData extends LoaderData,
  > = (props: {
    qc: QueryClient
    params: TRouteParams
    ctx: Ctx
  }) => Promise<TLoaderData>

  export type Component<
    TRouteParams extends RouteParams,
    TLoaderData extends LoaderData | undefined,
  > = (props: {
    params: TRouteParams
    loaderData: TLoaderData
    ctx: Ctx
  }) => React.ReactNode

  export type TitleFn<
    TRouteParams extends RouteParams,
    TLoaderData extends LoaderData | undefined,
  > = (props: {
    params: TRouteParams
    loaderData: TLoaderData
    ctx: Ctx
  }) => string
  export type Title<
    TRouteParams extends RouteParams,
    TLoaderData extends LoaderData | undefined,
  > = TitleFn<TRouteParams, TLoaderData> | string

  export type Meta<
    TRouteParams extends RouteParams,
    TLoaderData extends LoaderData | undefined,
  > = (props: {
    params: TRouteParams
    loaderData: TLoaderData
    ctx: Ctx
  }) => MetaDescriptor[]

  export type Page<
    TRoute extends Route = Route,
    TRouteParams extends RouteParams<TRoute> = RouteParams<TRoute>,
    TLoaderData extends LoaderData = LoaderData,
  > = {
    route: TRoute
    loader: Loader<TRouteParams, TLoaderData>
    meta: Meta<TRouteParams, TLoaderData> | undefined
    component: Component<TRouteParams, TLoaderData> | undefined
  }

  export const route = <
    TRoute extends Route,
    TRouteParams extends RouteParams<TRoute>,
  >(
    routeDefinition: TRoute,
  ) => {
    return {
      component: (componentDefinition: Component<TRouteParams, undefined>) => {
        return {
          route: routeDefinition,
          loader: undefined,
          meta: undefined,
          Component: componentDefinition,
        }
      },
      meta: (metaDefinition: Meta<TRouteParams, undefined>) => {
        return {
          component: (
            componentDefinition: Component<TRouteParams, undefined>,
          ) => {
            return {
              route: routeDefinition,
              loader: undefined,
              meta: metaDefinition,
              Component: componentDefinition,
            }
          },
        }
      },
      title: (titleDefinition: Title<TRouteParams, undefined>) => {
        return {
          component: (
            componentDefinition: Component<TRouteParams, undefined>,
          ) => {
            const metaDefinition: Meta<TRouteParams, undefined> = (props) => [
              {
                title:
                  typeof titleDefinition === "string"
                    ? titleDefinition
                    : titleDefinition(props),
              },
            ]
            return {
              route: routeDefinition,
              loader: undefined,
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
