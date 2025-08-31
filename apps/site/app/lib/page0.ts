import type { Route0 } from "@shmoject/modules/lib/route0.sh"
import type { SiteCtx } from "@shmoject/site/lib/ctx"
import type { QueryClient } from "@tanstack/react-query"
import type { MetaDescriptor } from "react-router"

// TODO: fix type export

// TODO: layout0
// TODO: layout0 loaderData → route0 loaderData
// TODO: use in react router

// TODO: ? .create({})
// TODO: metaError, metaLoading
// TODO: titleError, titleLoading
// TODO: title exact or suffix or prefix

export class Page0<TRoute extends Page0.Route, TLoader extends Page0.Loader<TRoute> | undefined> {
  static titleSuffix = " | shmoject"

  public readonly route: TRoute
  public readonly loader: TLoader
  private readonly meta: Page0.Meta<TRoute, TLoader> | undefined
  private readonly title: Page0.Title<TRoute, TLoader> | undefined
  public readonly component: Page0.Component<TRoute, TLoader>

  private constructor(input: Page0.CreateInputWithLoader<TRoute, TLoader>)
  private constructor(input: Page0.CreateInputWithoutLoader<TRoute>)
  private constructor(input: Page0.CreateInput<TRoute, TLoader>) {
    this.route = input.route
    this.loader = input.loader as TLoader
    this.meta = input.meta
    this.title = input.title
    this.component = input.component
  }

  static create<TRoute extends Page0.Route, TLoader extends Page0.Loader<TRoute>>(
    input: Page0.CreateInputWithLoader<TRoute, TLoader>,
  ): Page0<TRoute, TLoader>
  static create<TRoute extends Page0.Route, TLoader extends undefined>(
    input: Page0.CreateInputWithoutLoader<TRoute>,
  ): Page0<TRoute, TLoader>
  static create<TRoute extends Page0.Route, TLoader extends Page0.Loader<TRoute> | undefined>(
    input: Page0.CreateInput<TRoute, TLoader>,
  ): Page0<TRoute, TLoader> {
    return new Page0<TRoute, TLoader>(input as never)
  }

  private static createEmptyLoader = (): Page0.EmptyLoader => {
    return async () => ({})
  }

  private static titleOutputToValue(titleOutput: Page0.TitleOutput): string {
    if (typeof titleOutput === "string") {
      return titleOutput
    }
    if (typeof titleOutput === "object" && "value" in titleOutput) {
      const { value, exact } = titleOutput
      if (exact) {
        return value
      } else {
        return value + Page0.titleSuffix
      }
    }
    return String(titleOutput)
  }

  private static titleOutputToMetaDescriptors(titleOutput: Page0.TitleOutput): MetaDescriptor[] {
    return [{ title: Page0.titleOutputToValue(titleOutput) }]
  }

  getLoaderForce() {
    if (this.loader) {
      return this.loader
    }
    return Page0.createEmptyLoader()
  }

  getMeta() {
    return ((props) => {
      const result: MetaDescriptor[] = []
      if (this.meta) {
        result.push(...this.meta(props))
      }
      if (this.title) {
        if (typeof this.title === "function") {
          result.push(...Page0.titleOutputToMetaDescriptors(this.title(props)))
        } else {
          result.push(...Page0.titleOutputToMetaDescriptors(this.title))
        }
      }
      return result
    }) satisfies Page0.Meta<TRoute, TLoader>
  }

  // Builder
  static route<TRoute extends Page0.Route>(route: TRoute) {
    return {
      component: (component: Page0.Component<TRoute, undefined>) => {
        return Page0.create({
          route,
          loader: undefined,
          meta: undefined,
          title: undefined,
          component,
        })
      },

      meta: (meta: Page0.Meta<TRoute, undefined>) => {
        return {
          component: (component: Page0.Component<TRoute, undefined>) => {
            return Page0.create<TRoute, undefined>({
              route,
              loader: undefined,
              meta,
              title: undefined,
              component: component,
            })
          },
        }
      },

      title: (title: Page0.Title<TRoute, undefined>) => {
        return {
          component: (component: Page0.Component<TRoute, undefined>) => {
            return Page0.create({
              route,
              loader: undefined,
              meta: undefined,
              title,
              component,
            })
          },
          meta: (meta: Page0.Meta<TRoute, undefined>) => {
            return {
              component: (component: Page0.Component<TRoute, undefined>) => {
                return Page0.create({
                  route,
                  loader: undefined,
                  meta,
                  title,
                  component,
                })
              },
            }
          },
        }
      },

      loader: <TLoader extends Page0.Loader<TRoute>>(loader: TLoader) => {
        return {
          component: (component: Page0.Component<TRoute, TLoader>) => {
            return Page0.create({
              route,
              loader,
              meta: undefined,
              title: undefined,
              component,
            })
          },

          meta: (meta: Page0.Meta<TRoute, TLoader>) => {
            return {
              component: (component: Page0.Component<TRoute, TLoader>) => {
                return Page0.create({
                  route,
                  loader,
                  meta,
                  title: undefined,
                  component,
                })
              },
            }
          },

          title: (title: Page0.Title<TRoute, TLoader>) => {
            return {
              component: (component: Page0.Component<TRoute, TLoader>) => {
                return Page0.create({
                  route,
                  loader,
                  meta: undefined,
                  title,
                  component,
                })
              },
              meta: (meta: Page0.Meta<TRoute, TLoader>) => {
                return {
                  component: (component: Page0.Component<TRoute, TLoader>) => {
                    return Page0.create({
                      route,
                      loader,
                      meta,
                      title,
                      component,
                    })
                  },
                }
              },
            }
          },
        }
      },
    }
  }
}

export namespace Page0 {
  export type Ctx = SiteCtx.Ctx

  export type Route = Route0<any, any, any, any>
  export type RouteParams<TRoute extends Route> = Route0.Params<TRoute>
  export type RouteQuery<TRoute extends Route> = Route0.Query<TRoute>
  export type EmptyLoaderData = Record<never, never>
  export type FilledLoaderData = Record<string, any>

  export type WithRouteParams<TRoute extends Route> = { params: RouteParams<TRoute> }
  export type WithRouteQuery<TRoute extends Route> = { query: RouteQuery<TRoute> }
  export type WithRouteParamsAndQuery<TRoute extends Route> = WithRouteParams<TRoute> & WithRouteQuery<TRoute>
  export type WithQc = { qc: QueryClient }
  export type WithCtx = { ctx: Ctx }

  export type EmptyLoader = (...args: any[]) => Promise<EmptyLoaderData>
  export type Loader<TRoute extends Route> = (
    props: WithRouteParamsAndQuery<TRoute> & WithCtx & WithQc,
  ) => Promise<FilledLoaderData>
  export type LoaderData<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = TLoader extends (
    ...args: any[]
  ) => Promise<infer TData>
    ? Awaited<TData>
    : EmptyLoaderData
  export type WithLoaderData<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = {
    loaderData: LoaderData<TRoute, TLoader>
  }

  export type Component<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = (
    props: WithRouteParamsAndQuery<TRoute> & WithLoaderData<TRoute, TLoader> & WithCtx,
  ) => React.ReactNode

  export type TitleOutputString = string
  export type TitleOutputRecord = { value: string; exact?: boolean }
  export type TitleOutput = TitleOutputString | TitleOutputRecord
  export type TitleFn<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = (
    props: WithRouteParamsAndQuery<TRoute> & WithLoaderData<TRoute, TLoader> & WithCtx,
  ) => TitleOutput
  export type Title<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> =
    | TitleFn<TRoute, TLoader>
    | TitleOutput

  export type Meta<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = (
    props: WithRouteParamsAndQuery<TRoute> & WithLoaderData<TRoute, TLoader> & WithCtx,
  ) => MetaDescriptor[]

  export type CreateInputWithLoader<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = {
    route: TRoute
    loader: TLoader
    title?: Title<TRoute, TLoader>
    meta?: Meta<TRoute, TLoader>
    component: Component<TRoute, TLoader>
  }
  export type CreateInputWithoutLoader<TRoute extends Route = Route> = {
    route: TRoute
    loader?: undefined
    title?: Title<TRoute, EmptyLoader>
    meta?: Meta<TRoute, EmptyLoader>
    component: Component<TRoute, EmptyLoader>
  }
  export type CreateInput<
    TRoute extends Route,
    TLoader extends Loader<TRoute> | undefined,
  > = TLoader extends Loader<TRoute> ? CreateInputWithLoader<TRoute, TLoader> : CreateInputWithoutLoader<TRoute>
}
