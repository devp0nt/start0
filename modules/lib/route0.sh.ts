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
  TPathDefinition extends Route0._PathDefinition<TPathOriginalDefinition>,
  TParamsDefinition extends Route0._ParamsDefinition<TPathOriginalDefinition>,
  TQueryDefinition extends Route0._QueryDefinition<TPathOriginalDefinition>,
> {
  pathOriginalDefinition: TPathOriginalDefinition
  pathDefinition: TPathDefinition
  paramsDefinition: TParamsDefinition
  queryDefinition: TQueryDefinition
  baseUrl: string

  private constructor(definition: TPathOriginalDefinition, config: Route0.RouteConfigInput = {}) {
    this.pathOriginalDefinition = definition as TPathOriginalDefinition
    this.pathDefinition = Route0._getPathDefinitionByOriginalDefinition(definition) as TPathDefinition
    this.paramsDefinition = Route0._getParamsDefinitionByRouteDefinition(definition) as TParamsDefinition
    this.queryDefinition = Route0._getQueryDefinitionByRouteDefinition(definition) as TQueryDefinition

    const { baseUrl } = config
    if (baseUrl && typeof baseUrl === "string" && baseUrl.length) {
      this.baseUrl = baseUrl
    } else if (typeof window !== "undefined" && window?.location?.origin) {
      this.baseUrl = window.location.origin
    } else {
      this.baseUrl = "https://example.com"
    }
  }

  static create<
    TPathOriginalDefinition extends string,
    TPathDefinition extends Route0._PathDefinition<TPathOriginalDefinition>,
    TParamsDefinition extends Route0._ParamsDefinition<TPathOriginalDefinition>,
    TQueryDefinition extends Route0._QueryDefinition<TPathOriginalDefinition>,
  >(definition: TPathOriginalDefinition, config?: Route0.RouteConfigInput) {
    return new Route0<TPathOriginalDefinition, TPathDefinition, TParamsDefinition, TQueryDefinition>(definition, config)
  }

  // ---------- statics ----------

  private static _splitPathDefinitionAndQueryTailDefinition(pathOriginalDefinition: string) {
    const i = pathOriginalDefinition.indexOf("&")
    if (i === -1) return { pathDefinition: pathOriginalDefinition, queryTailDefinition: "" }
    return {
      pathDefinition: pathOriginalDefinition.slice(0, i),
      queryTailDefinition: pathOriginalDefinition.slice(i),
    }
  }

  private static _getAbsPath(baseUrl: string, pathWithQuery: string) {
    return new URL(pathWithQuery, baseUrl).toString().replace(/\/$/, "")
  }

  private static _getPathDefinitionByOriginalDefinition<TPathOriginalDefinition extends string>(
    pathOriginalDefinition: TPathOriginalDefinition,
  ) {
    const { pathDefinition } = Route0._splitPathDefinitionAndQueryTailDefinition(pathOriginalDefinition)
    return pathDefinition as Route0._PathDefinition<TPathOriginalDefinition>
  }

  private static _getParamsDefinitionByRouteDefinition<TPathOriginalDefinition extends string>(
    pathOriginalDefinition: TPathOriginalDefinition,
  ) {
    const { pathDefinition } = Route0._splitPathDefinitionAndQueryTailDefinition(pathOriginalDefinition)
    const matches = Array.from(pathDefinition.matchAll(/:([A-Za-z0-9_]+)/g))
    const paramsDefinition = Object.fromEntries(matches.map((m) => [m[1], true]))
    return paramsDefinition as Route0._ParamsDefinition<TPathOriginalDefinition>
  }

  private static _getQueryDefinitionByRouteDefinition<TPathOriginalDefinition extends string>(
    pathOriginalDefinition: TPathOriginalDefinition,
  ) {
    const { queryTailDefinition } = Route0._splitPathDefinitionAndQueryTailDefinition(pathOriginalDefinition)
    if (!queryTailDefinition) {
      return {} as Route0._QueryDefinition<TPathOriginalDefinition>
    }
    const keys = queryTailDefinition.split("&").map(Boolean)
    const queryDefinition = Object.fromEntries(keys.map((k) => [k, true]))
    return queryDefinition as Route0._QueryDefinition<TPathOriginalDefinition>
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

  extend<TSuffixDefinition extends string>(
    suffixDefinition: TSuffixDefinition,
  ): Route0<
    Route0._RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>,
    Route0._PathDefinition<Route0._RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
    Route0._ParamsDefinition<Route0._RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
    Route0._QueryDefinition<Route0._RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>
  > {
    const { pathDefinition: parentPathDefinition } = Route0._splitPathDefinitionAndQueryTailDefinition(
      this.pathOriginalDefinition,
    )
    const { pathDefinition: suffixPathDefinition, queryTailDefinition: suffixQueryTailDefinition } =
      Route0._splitPathDefinitionAndQueryTailDefinition(suffixDefinition)
    const pathDefinition = `${parentPathDefinition}/${suffixPathDefinition}`.replace(/\/{2,}/g, "/")
    const pathOriginalDefinition =
      `${pathDefinition}${suffixQueryTailDefinition}` as Route0._RoutePathOriginalDefinitionExtended<
        TPathOriginalDefinition,
        TSuffixDefinition
      >
    return new Route0<
      Route0._RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>,
      Route0._PathDefinition<Route0._RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
      Route0._ParamsDefinition<Route0._RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
      Route0._QueryDefinition<Route0._RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>
    >(pathOriginalDefinition, { baseUrl: this.baseUrl })
  }

  // ===== OVERLOADS =====
  // With params — shorthand: get(params) - MUST BE FIRST for proper autocompletion
  get(
    params: Route0._OnlyIfHasParams<TParamsDefinition, Route0._ParamsInput<TParamsDefinition>>,
  ): Route0._OnlyIfHasParams<TParamsDefinition, Route0._PathOnlyRouteValue<TPathOriginalDefinition>>

  // With params — two-arg form: get(params, { query?, abs? })
  get<
    O extends {
      query?: Route0._QueryInput<TQueryDefinition>
      abs?: boolean
    },
  >(
    params: Route0._OnlyIfHasParams<TParamsDefinition, Route0._ParamsInput<TParamsDefinition>>,
    opts: O,
  ): Route0._OnlyIfHasParams<
    TParamsDefinition,
    O extends { abs: true }
      ? O extends { query: any }
        ? Route0._AbsoluteWithQueryRouteValue<TPathOriginalDefinition>
        : Route0._AbsolutePathOnlyRouteValue<TPathOriginalDefinition>
      : O extends { query: any }
        ? Route0._WithQueryRouteValue<TPathOriginalDefinition>
        : Route0._PathOnlyRouteValue<TPathOriginalDefinition>
  >

  // No params - these come after params overloads to avoid conflicts
  get(
    ...args: Route0._OnlyIfNoParams<TParamsDefinition, [], [never]>
  ): Route0._PathOnlyRouteValue<TPathOriginalDefinition>
  get(
    props: Route0._OnlyIfNoParams<TParamsDefinition, { query: Route0._QueryInput<TQueryDefinition>; abs?: false }>,
  ): Route0._WithQueryRouteValue<TPathOriginalDefinition>
  get(
    props: Route0._OnlyIfNoParams<TParamsDefinition, { query: Route0._QueryInput<TQueryDefinition>; abs: true }>,
  ): Route0._AbsoluteWithQueryRouteValue<TPathOriginalDefinition>
  get(
    props: Route0._OnlyIfNoParams<TParamsDefinition, { query?: undefined; abs?: false }>,
  ): Route0._WithQueryRouteValue<TPathOriginalDefinition>
  get(
    props: Route0._OnlyIfNoParams<TParamsDefinition, { query?: undefined; abs: true }>,
  ): Route0._AbsolutePathOnlyRouteValue<TPathOriginalDefinition>
  get(
    props: Route0._OnlyIfNoParams<TParamsDefinition, { abs: false }>,
  ): Route0._PathOnlyRouteValue<TPathOriginalDefinition>
  get(
    props: Route0._OnlyIfNoParams<TParamsDefinition, { abs: true }>,
  ): Route0._AbsolutePathOnlyRouteValue<TPathOriginalDefinition>

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
}

export namespace Route0 {
  export type RouteConfigInput = {
    baseUrl?: string
  }
  export type Params<TRoute0 extends Route0<any, any, any, any>> = {
    [K in keyof TRoute0["paramsDefinition"]]: string
  }
  export type Query<TRoute0 extends Route0<any, any, any, any>> = Partial<
    {
      [K in keyof TRoute0["queryDefinition"]]: string | undefined
    } & Record<string, string | undefined>
  >

  export type _TrimQueryDefinitionString<S extends string> = S extends `${infer P}&${string}` ? P : S
  export type _QueryDefinitionStringTailWithoutFirstAmp<S extends string> = S extends `${string}&${infer T}` ? T : ""
  export type _QueryDefinitionStringTailWithFirstAmp<S extends string> = S extends ""
    ? ""
    : `&${_QueryDefinitionStringTailWithoutFirstAmp<S>}`
  export type _AmpSplit<S extends string> = S extends `${infer A}&${infer B}` ? A | _AmpSplit<B> : S
  export type _NonEmpty<T> = [T] extends ["" | never] ? never : T
  export type _ExtractPathParams<S extends string> = S extends `${string}:${infer After}`
    ? After extends `${infer Name}/${infer Rest}`
      ? Name | _ExtractPathParams<`/${Rest}`>
      : After
    : never
  export type _ReplacePathParams<S extends string> = S extends `${infer Head}:${infer Tail}`
    ? Tail extends `${infer _Param}/${infer Rest}`
      ? _ReplacePathParams<`${Head}${string}/${Rest}`>
      : `${Head}${string}`
    : S
  type _DedupeSlashes<S extends string> = S extends `${infer A}//${infer B}` ? _DedupeSlashes<`${A}/${B}`> : S
  type _EmptyRecord = Record<never, never>
  type _JoinPath<Parent extends string, Suffix extends string> = _DedupeSlashes<
    _PathDefinition<Parent> extends infer A extends string
      ? _PathDefinition<Suffix> extends infer B extends string
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

  export type _OnlyIfNoParams<TParams extends object, Yes, No = never> = keyof TParams extends never ? Yes : No
  export type _OnlyIfHasParams<TParams extends object, Yes, No = never> = keyof TParams extends never ? No : Yes

  export type _PathDefinition<TPathOriginalDefinition extends string> =
    _TrimQueryDefinitionString<TPathOriginalDefinition>
  export type _ParamsDefinition<TPathOriginalDefinition extends string> = _ExtractPathParams<
    _PathDefinition<TPathOriginalDefinition>
  > extends infer U
    ? [U] extends [never]
      ? _EmptyRecord
      : { [K in Extract<U, string>]: true }
    : _EmptyRecord
  export type _QueryDefinition<TPathOriginalDefinition extends string> = _NonEmpty<
    _QueryDefinitionStringTailWithoutFirstAmp<TPathOriginalDefinition>
  > extends infer Tail extends string
    ? _AmpSplit<Tail> extends infer U
      ? [U] extends [never]
        ? _EmptyRecord
        : { [K in Extract<U, string>]: true }
      : _EmptyRecord
    : _EmptyRecord
  export type _RoutePathOriginalDefinitionExtended<
    TSourcePathOriginalDefinition extends string,
    TSuffixPathOriginalDefinition extends string,
  > = `${_JoinPath<TSourcePathOriginalDefinition, TSuffixPathOriginalDefinition>}${_QueryDefinitionStringTailWithFirstAmp<TSuffixPathOriginalDefinition>}`

  export type _ParamsInput<TParamsDefinition extends object> = {
    [K in keyof TParamsDefinition]: string | number
  }
  export type _QueryInput<TQueryDefinition extends object> = Partial<{
    [K in keyof TQueryDefinition]: string | number
  }> &
    Record<string, string | number>

  export type _PathOnlyRouteValue<TPathOriginalDefinition extends string> =
    `${_ReplacePathParams<_PathDefinition<TPathOriginalDefinition>>}`
  export type _WithQueryRouteValue<TPathOriginalDefinition extends string> =
    `${_ReplacePathParams<_PathDefinition<TPathOriginalDefinition>>}?${string}`
  export type _AbsolutePathOnlyRouteValue<TPathOriginalDefinition extends string> =
    `${string}${_PathOnlyRouteValue<TPathOriginalDefinition>}`
  export type _AbsoluteWithQueryRouteValue<TPathOriginalDefinition extends string> =
    `${string}${_WithQueryRouteValue<TPathOriginalDefinition>}`
}
