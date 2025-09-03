import type { Route0 } from "@ideanick/modules/lib/route0.sh"
import type { QueryClient } from "@tanstack/react-query"
import type { SiteCtx } from "apps/site/src/lib/ctx"
import type { MetaDescriptor } from "react-router"

// TODO: make type Page0 normally exportable, now if Page0<any, any> everything is any
// TODO: try return component, to preserve hotreload
// TODO: useLoaderData → react router
// TODO: clientLoader
// TODO: ? .create({})
// TODO: metaError, metaLoading
// TODO: titleError, titleLoading
// TODO: title exact or suffix or prefix

export class Page0<TRoute extends Page0.Route, TLoader extends Page0.Loader<TRoute> | undefined> {
  static titleSuffix = " | ideanick"

  public readonly route: TRoute
  public readonly loader: TLoader
  private readonly metaOriginal: Page0.Meta<TRoute, TLoader> | undefined
  private readonly titleOriginal: Page0.Title<TRoute, TLoader> | undefined
  public readonly meta: Page0.Meta<TRoute, TLoader>
  public readonly component: Page0.Component<TRoute, TLoader>
  public readonly layouts: Page0.Layouts

  private constructor(input: Page0.CreateInputWithLoader<TRoute, TLoader>)
  private constructor(input: Page0.CreateInputWithoutLoader<TRoute>)
  private constructor(input: Page0.CreateInput<TRoute, TLoader>) {
    this.route = input.route
    this.loader = input.loader as TLoader
    this.metaOriginal = input.meta
    this.titleOriginal = input.title
    this.meta = this.getMeta()
    this.layouts = Page0.normalizeLayoutsInput(input.layout)
    this.component = input.component
    // TODO: check if it works in dev tools
    this.component.displayName = input.route.getDefinition()
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

  private static normalizeLayoutSingleInput(layoutsInputSingle: Page0.LayoutsInputSingle): string {
    if (typeof layoutsInputSingle === "string") {
      return layoutsInputSingle
    }
    return layoutsInputSingle.path
  }

  private static normalizeLayoutsInput(layoutsInput: Page0.LayoutsInput | undefined): Page0.Layouts {
    if (!layoutsInput) {
      return []
    }
    if (Array.isArray(layoutsInput)) {
      return layoutsInput.map(Page0.normalizeLayoutSingleInput)
    }
    return [Page0.normalizeLayoutSingleInput(layoutsInput)]
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

  private getMeta() {
    return ((props) => {
      const result: MetaDescriptor[] = []
      if (this.metaOriginal) {
        result.push(...this.metaOriginal(props))
      }
      if (this.titleOriginal) {
        if (typeof this.titleOriginal === "function") {
          result.push(...Page0.titleOutputToMetaDescriptors(this.titleOriginal(props)))
        } else {
          result.push(...Page0.titleOutputToMetaDescriptors(this.titleOriginal))
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

      layout: (layouts: Page0.LayoutsInput) => {
        return {
          component: (component: Page0.Component<TRoute, undefined>) => {
            return Page0.create({
              route,
              loader: undefined,
              meta: undefined,
              title: undefined,
              component,
              layout: layouts,
            })
          },
        }
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

          layout: (layouts: Page0.LayoutsInput) => {
            return {
              component: (component: Page0.Component<TRoute, undefined>) => {
                return Page0.create({
                  route,
                  loader: undefined,
                  meta,
                  title: undefined,
                  component,
                  layout: layouts,
                })
              },
            }
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

          layout: (layouts: Page0.LayoutsInput) => {
            return {
              component: (component: Page0.Component<TRoute, undefined>) => {
                return Page0.create({
                  route,
                  loader: undefined,
                  meta: undefined,
                  title: undefined,
                  component,
                  layout: layouts,
                })
              },
            }
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

              layout: (layouts: Page0.LayoutsInput) => {
                return {
                  component: (component: Page0.Component<TRoute, undefined>) => {
                    return Page0.create({
                      route,
                      loader: undefined,
                      meta,
                      title: undefined,
                      component,
                      layout: layouts,
                    })
                  },
                }
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

          layout: (layouts: Page0.LayoutsInput) => {
            return {
              component: (component: Page0.Component<TRoute, TLoader>) => {
                return Page0.create({
                  route,
                  loader,
                  meta: undefined,
                  title: undefined,
                  component,
                  layout: layouts,
                })
              },
            }
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

              layout: (layouts: Page0.LayoutsInput) => {
                return {
                  component: (component: Page0.Component<TRoute, TLoader>) => {
                    return Page0.create({
                      route,
                      loader,
                      meta,
                      title: undefined,
                      component,
                      layout: layouts,
                    })
                  },
                }
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

              layout: (layouts: Page0.LayoutsInput) => {
                return {
                  component: (component: Page0.Component<TRoute, TLoader>) => {
                    return Page0.create({
                      route,
                      loader,
                      meta: undefined,
                      title: undefined,
                      component,
                      layout: layouts,
                    })
                  },
                }
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
                  layout: (layouts: Page0.LayoutsInput) => {
                    return {
                      component: (component: Page0.Component<TRoute, TLoader>) => {
                        return Page0.create({
                          route,
                          loader,
                          meta: undefined,
                          title: undefined,
                          component,
                          layout: layouts,
                        })
                      },
                    }
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
  ) => Promise<FilledLoaderData> | FilledLoaderData
  export type LoaderData<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = TLoader extends (
    ...args: any[]
  ) => Promise<infer TData>
    ? Awaited<TData>
    : TLoader extends (...args: any[]) => infer TData
      ? TData
      : EmptyLoaderData
  export type WithLoaderData<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = {
    loaderData: LoaderData<TRoute, TLoader>
  }

  export type Component<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = React.FC<
    WithRouteParamsAndQuery<TRoute> & WithLoaderData<TRoute, TLoader> & WithCtx
  >

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

  export type LayoutsInputSingle = string | { path: string }
  export type LayoutsInput = LayoutsInputSingle[] | LayoutsInputSingle
  export type Layouts = string[]

  export type CreateInputWithLoader<TRoute extends Route, TLoader extends Loader<TRoute> | undefined> = {
    route: TRoute
    loader: TLoader
    title?: Title<TRoute, TLoader>
    meta?: Meta<TRoute, TLoader>
    layout?: LayoutsInput
    component: Component<TRoute, TLoader>
  }
  export type CreateInputWithoutLoader<TRoute extends Route = Route> = {
    route: TRoute
    loader?: undefined
    title?: Title<TRoute, EmptyLoader>
    meta?: Meta<TRoute, EmptyLoader>
    layout?: LayoutsInput
    component: Component<TRoute, EmptyLoader>
  }
  export type CreateInput<
    TRoute extends Route,
    TLoader extends Loader<TRoute> | undefined,
  > = TLoader extends Loader<TRoute> ? CreateInputWithLoader<TRoute, TLoader> : CreateInputWithoutLoader<TRoute>
}
