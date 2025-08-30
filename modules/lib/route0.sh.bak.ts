// TODO: refactor
// TODO: on extend, do not get query params from parent
// TODO: .create(route, {baseUrl})
// TODO: get(), get({...params, query?, abs?})
// TODO: overrideMany
// TODO: self as function
// TODO: .create(route, {useQuery, useParams})
// TODO: getPathDefinition
// TODO: check extend for params only

// TODO: Из пас экзакт, из пасвизквери экзает, из чилдрен, из парент, из экзактОр
// TODO: isEqual, isChildren, isParent
// TODO: extractParams, extractQuery
// TODO: getPathDefinition respecting definitionParamPrefix, definitionQueryPrefix
// TODO: prepend
// TODO: Route0.createTree({base:{self: x, children: ...})
// TODO: overrideTree
// TODO: .create(route, {baseUrl, useLocation})
// TODO: ? optional path params as @
// TODO: prependMany, extendMany, overrideMany, with types

export class Route0<
  TPathOriginalDefinition extends string,
  TPathDefinition extends Route0.PathDefinition<TPathOriginalDefinition>,
  TParamsDefinition extends Route0.ParamsDefinition<TPathOriginalDefinition>,
  TQueryDefinition extends Route0.QueryDefinition<TPathOriginalDefinition>,
> {
  pathOriginalDefinition: TPathOriginalDefinition
  pathDefinition: TPathDefinition
  paramsDefinition: TParamsDefinition
  queryDefinition: TQueryDefinition
  baseUrl: string

  private constructor(definition: TPathOriginalDefinition, config: Route0.RouteConfigInput = {}) {
    this.pathOriginalDefinition = definition as TPathOriginalDefinition
    this.pathDefinition = Route0.getPathDefinitionByOriginalDefinition(definition) as TPathDefinition
    this.paramsDefinition = Route0.getParamsDefinitionByRouteDefinition(definition) as TParamsDefinition
    this.queryDefinition = Route0.getQueryDefinitionByRouteDefinition(definition) as TQueryDefinition

    const { baseUrl } = config
    if (baseUrl && typeof baseUrl === "string" && baseUrl.length) {
      this.baseUrl = Route0._removeSlashFromEnd(baseUrl)
    } else if (typeof window !== "undefined" && window?.location?.origin) {
      this.baseUrl = Route0._removeSlashFromEnd(window.location.origin)
    } else {
      this.baseUrl = "https://example.com"
    }
  }

  static create<
    TPathOriginalDefinition extends string,
    TPathDefinition extends Route0.PathDefinition<TPathOriginalDefinition>,
    TParamsDefinition extends Route0.ParamsDefinition<TPathOriginalDefinition>,
    TQueryDefinition extends Route0.QueryDefinition<TPathOriginalDefinition>,
  >(definition: TPathOriginalDefinition, config?: Route0.RouteConfigInput) {
    return new Route0<TPathOriginalDefinition, TPathDefinition, TParamsDefinition, TQueryDefinition>(definition, config)
  }

  // ---------- statics ----------

  private static _splitPathDefinitionAndQueryTail(pathOriginalDefinition: string) {
    const i = pathOriginalDefinition.indexOf("&")
    if (i === -1) return { pathDefinition: pathOriginalDefinition, queryTailDefinition: "" }
    return {
      pathDefinition: pathOriginalDefinition.slice(0, i),
      queryTailDefinition: pathOriginalDefinition.slice(i + 1),
    }
  }

  private static _removeSlashFromEnd(str: string) {
    return str.replace(/\/+$/, "")
  }

  private static _addSlashToStart(str: string) {
    if (str.startsWith("/")) return str
    return `/${str}`
  }

  private static _getAbsPath(baseUrl: string, pathWithQuery: string) {
    return new URL(pathWithQuery, baseUrl).toString().replace(/\/$/, "")
  }

  static getPathDefinitionByOriginalDefinition<TPathOriginalDefinition extends string>(
    pathOriginalDefinition: TPathOriginalDefinition,
  ) {
    const { pathDefinition } = Route0._splitPathDefinitionAndQueryTail(pathOriginalDefinition)
    return pathDefinition as Route0.PathDefinition<TPathOriginalDefinition>
  }

  static getParamsDefinitionByRouteDefinition<TPathOriginalDefinition extends string>(
    pathOriginalDefinition: TPathOriginalDefinition,
  ) {
    const { pathDefinition } = Route0._splitPathDefinitionAndQueryTail(pathOriginalDefinition)
    const matches = Array.from(pathDefinition.matchAll(/:([A-Za-z0-9_]+)/g))
    const paramsDefinition = Object.fromEntries(matches.map((m) => [m[1], true]))
    return paramsDefinition as Route0.ParamsDefinition<TPathOriginalDefinition>
  }

  static getQueryDefinitionByRouteDefinition<TPathOriginalDefinition extends string>(
    pathOriginalDefinition: TPathOriginalDefinition,
  ) {
    const { queryTailDefinition } = Route0._splitPathDefinitionAndQueryTail(pathOriginalDefinition)
    if (!queryTailDefinition) {
      return {} as Route0.QueryDefinition<TPathOriginalDefinition>
    }
    const keys = queryTailDefinition.split("&")
    const queryDefinition = Object.fromEntries(keys.map((k) => [k, true]))
    return queryDefinition as Route0.QueryDefinition<TPathOriginalDefinition>
  }

  // ---------- instance API ----------

  extend<TSuffixDefinition extends string>(
    suffixDefinition: TSuffixDefinition,
  ): Route0<
    Route0.RouteDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>,
    Route0.PathDefinition<Route0.RouteDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
    Route0.ParamsDefinition<Route0.RouteDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
    Route0.QueryDefinition<Route0.RouteDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>
  > {
    const { pathDefinition: parentPathDefinition } = Route0._splitPathDefinitionAndQueryTail(
      this.pathOriginalDefinition,
    )
    const { pathDefinition: suffixPathDefinition, queryTailDefinition: suffixQueryTailDefinition } =
      Route0._splitPathDefinitionAndQueryTail(suffixDefinition)
    const pathDefinition = `${parentPathDefinition}/${suffixPathDefinition}`.replace(/\/{2,}/g, "/")
    const pathOriginalDefinition = `${pathDefinition}${suffixQueryTailDefinition}` as Route0.RouteDefinitionExtended<
      TPathOriginalDefinition,
      TSuffixDefinition
    >
    return new Route0<
      Route0.RouteDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>,
      Route0.PathDefinition<Route0.RouteDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
      Route0.ParamsDefinition<Route0.RouteDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
      Route0.QueryDefinition<Route0.RouteDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>
    >(pathOriginalDefinition, { baseUrl: this.baseUrl })
  }

  // ===== OVERLOADS =====
  // With params — shorthand: get(params) - MUST BE FIRST for proper autocompletion
  get(
    params: Route0.OnlyIfHasParams<TParamsDefinition, Route0.ParamsInput<TParamsDefinition>>,
  ): Route0.OnlyIfHasParams<TParamsDefinition, Route0.PathOnlyRouteValue<TPathOriginalDefinition>>

  // With params — two-arg form: get(params, { query?, abs? })
  get<
    O extends {
      query?: Route0.QueryInput<TQueryDefinition>
      abs?: boolean
    },
  >(
    params: Route0.OnlyIfHasParams<TParamsDefinition, Route0.ParamsInput<TParamsDefinition>>,
    opts: O,
  ): Route0.OnlyIfHasParams<
    TParamsDefinition,
    O extends { abs: true }
      ? O extends { query: any }
        ? Route0.AbsoluteWithQueryRouteValue<TPathOriginalDefinition>
        : Route0.AbsolutePathOnlyRouteValue<TPathOriginalDefinition>
      : O extends { query: any }
        ? Route0.WithQueryRouteValue<TPathOriginalDefinition>
        : Route0.PathOnlyRouteValue<TPathOriginalDefinition>
  >

  // No params - these come after params overloads to avoid conflicts
  get(
    ...args: Route0.OnlyIfNoParams<TParamsDefinition, [], [never]>
  ): Route0.PathOnlyRouteValue<TPathOriginalDefinition>
  get(
    props: Route0.OnlyIfNoParams<TParamsDefinition, { query: Route0.QueryInput<TQueryDefinition>; abs?: false }>,
  ): Route0.WithQueryRouteValue<TPathOriginalDefinition>
  get(
    props: Route0.OnlyIfNoParams<TParamsDefinition, { query: Route0.QueryInput<TQueryDefinition>; abs: true }>,
  ): Route0.AbsoluteWithQueryRouteValue<TPathOriginalDefinition>
  get(
    props: Route0.OnlyIfNoParams<TParamsDefinition, { query?: undefined; abs?: false }>,
  ): Route0.WithQueryRouteValue<TPathOriginalDefinition>
  get(
    props: Route0.OnlyIfNoParams<TParamsDefinition, { query?: undefined; abs: true }>,
  ): Route0.AbsolutePathOnlyRouteValue<TPathOriginalDefinition>
  get(
    props: Route0.OnlyIfNoParams<TParamsDefinition, { abs: false }>,
  ): Route0.PathOnlyRouteValue<TPathOriginalDefinition>
  get(
    props: Route0.OnlyIfNoParams<TParamsDefinition, { abs: true }>,
  ): Route0.AbsolutePathOnlyRouteValue<TPathOriginalDefinition>

  // Disallow object-form with { params } entirely; only allow options for no-param routes

  // Implementation
  get(...args: any[]): string {
    const a = args[0]
    const b = args[1]
    const needed = Object.keys(this.paramsDefinition) as string[]

    let params: Record<string, any> | undefined
    let query: Record<string, any> | undefined
    let abs = false

    const isObj =
      typeof a === "object" && a !== null && ("params" in (a as any) || "query" in (a as any) || "abs" in (a as any))

    if (b !== undefined) {
      // Two-argument form: get(params, opts)
      if (needed.length === 0) {
        // No params expected; treat first arg as stray and only use opts
        params = undefined
      } else {
        params = a as any
      }
      query = b?.query as any
      abs = Boolean(b?.abs)
    } else if (isObj) {
      params = (a as any).params
      query = (a as any).query
      abs = Boolean((a as any).abs)
    } else if (a && typeof a === "object") {
      // Shorthand get(params) — only when params are defined
      if (needed.length === 0) {
        throw new Error(`This route has no path params; use get() or get({ query }).`)
      }
      params = a as any
    } else if (a === undefined) {
      // ok for routes without params
      if (needed.length > 0) {
        throw new Error(`Missing "params": expected keys ${needed.map((k) => `"${k}"`).join(", ")}.`)
      }
    }

    let url = String(this.pathDefinition)

    if (needed.length) {
      if (!params) {
        throw new Error(`Missing "params": expected keys ${needed.map((k) => `"${k}"`).join(", ")}.`)
      }
      for (const k of needed) {
        const v = params[k]
        if (v === undefined || v === null) {
          throw new Error(`Missing value for path param ":${k}".`)
        }
      }
    }

    // replace path params (if any)
    url = url.replace(/:([A-Za-z0-9_]+)/g, (_m, k) => encodeURIComponent(String(params?.[k] ?? "")))

    // Build query string: accept both declared and arbitrary keys
    if (query && Object.keys(query).length) {
      const parts: string[] = []
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue
        const values = Array.isArray(v) ? v : [v]
        for (const one of values) {
          parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(one))}`)
        }
      }
      if (parts.length) url += `?${parts.join("&")}`
    }

    // Normalize accidental double slashes in the final relative path
    url = url.replace(/\/{2,}/g, "/")

    const finalUrl = abs ? Route0._getAbsPath(this.baseUrl, url) : url
    return finalUrl
  }

  clone(config?: Route0.RouteConfigInput) {
    return new Route0(this.pathOriginalDefinition, config)
  }

  static overrideMany<T extends Record<string, Route0<any, any, any, any>>>(
    routes: T,
    config: Route0.RouteConfigInput,
  ): T {
    const result = {} as T
    for (const [key, value] of Object.entries(routes)) {
      ;(result as any)[key] = value.clone(config)
    }
    return result
  }
}

export namespace Route0 {
  // ---------- helpers (type-level) ----------
  type _TrimQueryDefinition<S extends string> = S extends `${infer P}&${string}` ? P : S
  type _QueryDefinitionTail<S extends string> = S extends `${string}&${infer T}` ? T : ""
  type _AmpSplit<S extends string> = S extends `${infer A}&${infer B}` ? A | _AmpSplit<B> : S
  type _NonEmpty<T> = [T] extends ["" | never] ? never : T
  type _ExtractPathParams<S extends string> = S extends `${string}:${infer After}`
    ? After extends `${infer Name}/${infer Rest}`
      ? Name | _ExtractPathParams<`/${Rest}`>
      : After
    : never
  type _ReplacePathParams<S extends string> = S extends `${infer Head}:${infer Tail}`
    ? Tail extends `${infer _Param}/${infer Rest}`
      ? _ReplacePathParams<`${Head}${string}/${Rest}`>
      : `${Head}${string}`
    : S

  type _NormalizeSlashes<S extends string> = S extends `${infer A}//${infer B}` ? _NormalizeSlashes<`${A}/${B}`> : S

  type _QuerySuffixUnion = "" | `?${string}`
  type _EmptyRecord = Record<never, never>

  // Join tails from two full route definitions: "&A&B" style or empty
  type _TailUnion<Src extends string, Suf extends string> = _NonEmpty<_QueryDefinitionTail<Src>> extends infer TA
    ? _NonEmpty<_QueryDefinitionTail<Suf>> extends infer TB
      ? [TA] extends [never]
        ? [TB] extends [never]
          ? ""
          : `&${Extract<TB, string>}`
        : [TB] extends [never]
          ? `&${Extract<TA, string>}`
          : `&${Extract<TA, string>}&${Extract<TB, string>}`
      : never
    : never

  type _JoinPath<Src extends string, Suf extends string> = _NormalizeSlashes<
    PathDefinition<Src> extends infer A extends string
      ? PathDefinition<Suf> extends infer B extends string
        ? A extends ""
          ? B extends ""
            ? ""
            : B extends `/${string}`
              ? B
              : `/${B}`
          : B extends ""
            ? A
            : A extends `${string}/`
              ? `${A}${B}`
              : B extends `/${string}`
                ? `${A}${B}`
                : `${A}/${B}`
        : never
      : never
  >

  // ---------- public types ----------

  export type RouteConfigInput = {
    baseUrl?: string
  }

  export type OnlyIfNoParams<TParams extends object, Yes, No = never> = keyof TParams extends never ? Yes : No

  export type OnlyIfHasParams<TParams extends object, Yes, No = never> = keyof TParams extends never ? No : Yes

  export type PathDefinition<TPathOriginalDefinition extends string> = _TrimQueryDefinition<TPathOriginalDefinition>

  export type ParamsDefinition<TPathOriginalDefinition extends string> = _ExtractPathParams<
    PathDefinition<TPathOriginalDefinition>
  > extends infer U
    ? [U] extends [never]
      ? _EmptyRecord
      : { [K in Extract<U, string>]: true }
    : _EmptyRecord

  export type QueryDefinition<TPathOriginalDefinition extends string> = _NonEmpty<
    _QueryDefinitionTail<TPathOriginalDefinition>
  > extends infer Tail extends string
    ? _AmpSplit<Tail> extends infer U
      ? [U] extends [never]
        ? _EmptyRecord
        : { [K in Extract<U, string>]: true }
      : _EmptyRecord
    : _EmptyRecord

  export type RouteDefinitionExtended<
    TSourcePathOriginalDefinition extends string,
    TSuffixPathOriginalDefinition extends string,
  > = `${_JoinPath<TSourcePathOriginalDefinition, TSuffixPathOriginalDefinition>}${_TailUnion<TSourcePathOriginalDefinition, TSuffixPathOriginalDefinition>}`

  export type ParamsInput<TParamsDefinition extends object> = {
    [K in keyof TParamsDefinition]: string | number | boolean
  }

  export type QueryInput<TQueryDefinition extends object> = Partial<{
    [K in keyof TQueryDefinition]: string | number | boolean | Array<string | number | boolean>
  }> &
    Record<string, string | number | boolean | Array<string | number | boolean>>

  export type RouteValue<TPathOriginalDefinition extends string> =
    `${_ReplacePathParams<PathDefinition<TPathOriginalDefinition>>}${_QuerySuffixUnion}`

  export type AbsoluteRouteValue<TPathOriginalDefinition extends string> =
    `${string}${RouteValue<TPathOriginalDefinition>}`

  // Precise return types depending on presence of query in get() calls
  export type PathOnlyRouteValue<TPathOriginalDefinition extends string> =
    `${_ReplacePathParams<PathDefinition<TPathOriginalDefinition>>}`
  export type WithQueryRouteValue<TPathOriginalDefinition extends string> =
    `${_ReplacePathParams<PathDefinition<TPathOriginalDefinition>>}?${string}`
  export type AbsolutePathOnlyRouteValue<TPathOriginalDefinition extends string> =
    `${string}${PathOnlyRouteValue<TPathOriginalDefinition>}`
  export type AbsoluteWithQueryRouteValue<TPathOriginalDefinition extends string> =
    `${string}${WithQueryRouteValue<TPathOriginalDefinition>}`

  // ---------- Export helpers ----------
  export type Params<TRoute0 extends Route0<any, any, any, any>> = {
    [K in keyof TRoute0["paramsDefinition"]]: string
  }

  export type Query<TRoute0 extends Route0<any, any, any, any>> = Partial<
    {
      [K in keyof TRoute0["queryDefinition"]]: string | undefined
    } & Record<string, string | undefined>
  >
}
