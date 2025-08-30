// TODO: refactor
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
  TFullPathDefinition extends string,
  TPathDefinition extends Route0.PathDefinition<TFullPathDefinition>,
  TParamsDefinition extends Route0.ParamsDefinition<TFullPathDefinition>,
  TQueryDefinition extends Route0.QueryDefinition<TFullPathDefinition>,
> {
  fullPathDefinition: TFullPathDefinition
  pathDefinition: TPathDefinition
  paramsDefinition: TParamsDefinition
  queryDefinition: TQueryDefinition
  baseUrl: string

  private constructor(
    fullPathDefinition: TFullPathDefinition,
    baseUrl?: string,
  ) {
    this.fullPathDefinition = Route0._normalizeFullDefinition(
      fullPathDefinition,
    ) as TFullPathDefinition

    this.pathDefinition = Route0.getPathDefinition(
      fullPathDefinition,
    ) as TPathDefinition

    this.paramsDefinition = Route0.getParamsDefinitionByRouteDefinition(
      fullPathDefinition,
    ) as TParamsDefinition

    this.queryDefinition = Route0.getQueryDefinitionByRouteDefinition(
      fullPathDefinition,
    ) as TQueryDefinition

    if (baseUrl && typeof baseUrl === "string" && baseUrl.length) {
      this.baseUrl = Route0._normalizeBase(baseUrl)
    } else if (typeof window !== "undefined" && window?.location?.origin) {
      this.baseUrl = Route0._normalizeBase(window.location.origin)
    } else {
      this.baseUrl = "https://example.com"
    }
  }

  static create<
    TFullPathDefinition extends string,
    TPathDefinition extends Route0.PathDefinition<TFullPathDefinition>,
    TParamsDefinition extends Route0.ParamsDefinition<TFullPathDefinition>,
    TQueryDefinition extends Route0.QueryDefinition<TFullPathDefinition>,
  >(fullPathDefinition: TFullPathDefinition, baseUrl?: string) {
    return new Route0<
      TFullPathDefinition,
      TPathDefinition,
      TParamsDefinition,
      TQueryDefinition
    >(fullPathDefinition, baseUrl)
  }

  // ---------- statics ----------

  private static _split(fullPathDefinition: string) {
    const i = fullPathDefinition.indexOf("&")
    if (i === -1) return { path: fullPathDefinition, queryTail: "" }
    return {
      path: fullPathDefinition.slice(0, i),
      queryTail: fullPathDefinition.slice(i + 1),
    }
  }

  private static _normalizeBase(base: string) {
    return base.replace(/\/+$/, "")
  }

  // Collapse multiple slashes in the *path* part only
  private static _normalizeFullDefinition(full: string) {
    const i = full.indexOf("&")
    if (i === -1) return full.replace(/\/{2,}/g, "/")
    const path = full.slice(0, i).replace(/\/{2,}/g, "/")
    return path + full.slice(i) // keep query tail intact
  }

  private static _joinAbsolute(baseUrl: string, pathWithQuery: string) {
    const base = Route0._normalizeBase(baseUrl)
    const path = pathWithQuery.startsWith("/")
      ? pathWithQuery
      : `/${pathWithQuery}`
    return new URL(path, base + "/").toString().replace(/\/$/, "")
  }

  static getPathDefinition<TFullPathDefinition extends string>(
    fullPathDefinition: TFullPathDefinition,
  ) {
    return Route0._split(fullPathDefinition)
      .path as Route0.PathDefinition<TFullPathDefinition>
  }

  static getParamsDefinitionByRouteDefinition<
    TFullPathDefinition extends string,
  >(fullPathDefinition: TFullPathDefinition) {
    const { path } = Route0._split(fullPathDefinition)
    const re = /:([A-Za-z0-9_]+)/g
    let m: RegExpExecArray | null
    const out: Record<string, true> = {}
    // biome-ignore lint/suspicious/noAssignInExpressions: <x>
    while ((m = re.exec(path))) out[m[1]] = true
    return (
      Object.keys(out).length ? out : ({} as Record<never, never>)
    ) as Route0.ParamsDefinition<TFullPathDefinition>
  }

  static getQueryDefinitionByRouteDefinition<
    TFullPathDefinition extends string,
  >(fullPathDefinition: TFullPathDefinition) {
    const { queryTail } = Route0._split(fullPathDefinition)
    if (!queryTail) {
      return {} as Route0.QueryDefinition<TFullPathDefinition>
    }
    const out: Record<string, true> = {}
    for (const k of queryTail.split("&")) {
      if (!k) continue
      out[k] = true
    }
    return (
      Object.keys(out).length ? out : ({} as Record<never, never>)
    ) as Route0.QueryDefinition<TFullPathDefinition>
  }

  // ---------- instance API ----------

  extend<TSuffixDefinition extends string>(
    suffixDefinition: TSuffixDefinition,
  ): Route0<
    Route0.RouteDefinitionExtended<TFullPathDefinition, TSuffixDefinition>,
    Route0.PathDefinition<
      Route0.RouteDefinitionExtended<TFullPathDefinition, TSuffixDefinition>
    >,
    Route0.ParamsDefinition<
      Route0.RouteDefinitionExtended<TFullPathDefinition, TSuffixDefinition>
    >,
    Route0.QueryDefinition<
      Route0.RouteDefinitionExtended<TFullPathDefinition, TSuffixDefinition>
    >
  > {
    const src = Route0._split(this.fullPathDefinition)
    const suf = Route0._split(suffixDefinition)

    // ensure exactly one slash between segments
    const needsSlash =
      src.path.length > 0 &&
      !src.path.endsWith("/") &&
      !suf.path.startsWith("/")

    const combinedPathRaw = `${src.path}${needsSlash ? "/" : ""}${suf.path}`
    const combinedPath = Route0._normalizeFullDefinition(combinedPathRaw)

    // merge (&) query keys from both sides, dedupe while preserving order
    const keys: string[] = []
    const pushKeys = (tail: string) => {
      if (!tail) return
      for (const k of tail.split("&")) {
        if (k && !keys.includes(k)) keys.push(k)
      }
    }
    pushKeys(src.queryTail)
    pushKeys(suf.queryTail)

    const queryTail = keys.join("&")
    const combinedFull = queryTail.length
      ? `${combinedPath}&${queryTail}`
      : combinedPath

    // Type-level: keep prior extended path typing; runtime uses full (with &)
    const routeDefinition = combinedFull as Route0.RouteDefinitionExtended<
      TFullPathDefinition,
      TSuffixDefinition
    >

    return new Route0<
      Route0.RouteDefinitionExtended<TFullPathDefinition, TSuffixDefinition>,
      Route0.PathDefinition<
        Route0.RouteDefinitionExtended<TFullPathDefinition, TSuffixDefinition>
      >,
      Route0.ParamsDefinition<
        Route0.RouteDefinitionExtended<TFullPathDefinition, TSuffixDefinition>
      >,
      Route0.QueryDefinition<
        Route0.RouteDefinitionExtended<TFullPathDefinition, TSuffixDefinition>
      >
    >(routeDefinition, this.baseUrl)
  }

  // ===== OVERLOADS =====
  // With params — shorthand: get(params) - MUST BE FIRST for proper autocompletion
  get(
    params: Route0.OnlyIfHasParams<
      TParamsDefinition,
      Route0.ParamsInput<TParamsDefinition>
    >,
  ): Route0.OnlyIfHasParams<
    TParamsDefinition,
    Route0.PathOnlyRouteValue<TFullPathDefinition>
  >

  // With params — two-arg form: get(params, { query?, abs? })
  get<
    O extends {
      query?: Route0.QueryInput<TQueryDefinition>
      abs?: boolean
    },
  >(
    params: Route0.OnlyIfHasParams<
      TParamsDefinition,
      Route0.ParamsInput<TParamsDefinition>
    >,
    opts: O,
  ): Route0.OnlyIfHasParams<
    TParamsDefinition,
    O extends { abs: true }
      ? O extends { query: any }
        ? Route0.AbsoluteWithQueryRouteValue<TFullPathDefinition>
        : Route0.AbsolutePathOnlyRouteValue<TFullPathDefinition>
      : O extends { query: any }
        ? Route0.WithQueryRouteValue<TFullPathDefinition>
        : Route0.PathOnlyRouteValue<TFullPathDefinition>
  >

  // No params - these come after params overloads to avoid conflicts
  get(
    ...args: Route0.OnlyIfNoParams<TParamsDefinition, [], [never]>
  ): Route0.PathOnlyRouteValue<TFullPathDefinition>
  get(
    props: Route0.OnlyIfNoParams<
      TParamsDefinition,
      { query: Route0.QueryInput<TQueryDefinition>; abs?: false }
    >,
  ): Route0.WithQueryRouteValue<TFullPathDefinition>
  get(
    props: Route0.OnlyIfNoParams<
      TParamsDefinition,
      { query: Route0.QueryInput<TQueryDefinition>; abs: true }
    >,
  ): Route0.AbsoluteWithQueryRouteValue<TFullPathDefinition>
  get(
    props: Route0.OnlyIfNoParams<
      TParamsDefinition,
      { query?: undefined; abs?: false }
    >,
  ): Route0.WithQueryRouteValue<TFullPathDefinition>
  get(
    props: Route0.OnlyIfNoParams<
      TParamsDefinition,
      { query?: undefined; abs: true }
    >,
  ): Route0.AbsolutePathOnlyRouteValue<TFullPathDefinition>
  get(
    props: Route0.OnlyIfNoParams<TParamsDefinition, { abs: false }>,
  ): Route0.PathOnlyRouteValue<TFullPathDefinition>
  get(
    props: Route0.OnlyIfNoParams<TParamsDefinition, { abs: true }>,
  ): Route0.AbsolutePathOnlyRouteValue<TFullPathDefinition>

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
      typeof a === "object" &&
      a !== null &&
      ("params" in (a as any) || "query" in (a as any) || "abs" in (a as any))

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
        throw new Error(
          `This route has no path params; use get() or get({ query }).`,
        )
      }
      params = a as any
    } else if (a === undefined) {
      // ok for routes without params
      if (needed.length > 0) {
        throw new Error(
          `Missing "params": expected keys ${needed.map((k) => `"${k}"`).join(", ")}.`,
        )
      }
    }

    let url = String(this.pathDefinition)

    if (needed.length) {
      if (!params) {
        throw new Error(
          `Missing "params": expected keys ${needed.map((k) => `"${k}"`).join(", ")}.`,
        )
      }
      for (const k of needed) {
        const v = params[k]
        if (v === undefined || v === null) {
          throw new Error(`Missing value for path param ":${k}".`)
        }
      }
    }

    // replace path params (if any)
    url = url.replace(/:([A-Za-z0-9_]+)/g, (_m, k) =>
      encodeURIComponent(String(params?.[k] ?? "")),
    )

    // Build query string: accept both declared and arbitrary keys
    if (query && Object.keys(query).length) {
      const parts: string[] = []
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue
        const values = Array.isArray(v) ? v : [v]
        for (const one of values) {
          parts.push(
            `${encodeURIComponent(k)}=${encodeURIComponent(String(one))}`,
          )
        }
      }
      if (parts.length) url += `?${parts.join("&")}`
    }

    // Normalize accidental double slashes in the final relative path
    url = url.replace(/\/{2,}/g, "/")

    const finalUrl = abs ? Route0._joinAbsolute(this.baseUrl, url) : url
    return finalUrl
  }

  clone(baseUrl?: string) {
    return new Route0(this.fullPathDefinition, baseUrl)
  }

  static replaceManyBaseUrl<
    T extends Record<string, Route0<any, any, any, any>>,
  >(routes: T, baseUrl: string): T {
    const result = {} as T
    for (const [key, value] of Object.entries(routes)) {
      ;(result as any)[key] = value.clone(baseUrl)
    }
    return result
  }
}

export namespace Route0 {
  // ---------- helpers (type-level) ----------
  type _TrimSearch<S extends string> = S extends `${infer P}&${string}` ? P : S
  type _SearchTail<S extends string> = S extends `${string}&${infer T}` ? T : ""
  type _AmpSplit<S extends string> = S extends `${infer A}&${infer B}`
    ? A | _AmpSplit<B>
    : S
  type _NonEmpty<T> = [T] extends ["" | never] ? never : T
  type _ExtractPathParams<S extends string> =
    S extends `${string}:${infer After}`
      ? After extends `${infer Name}/${infer Rest}`
        ? Name | _ExtractPathParams<`/${Rest}`>
        : After
      : never
  type _ReplacePathParams<S extends string> =
    S extends `${infer Head}:${infer Tail}`
      ? Tail extends `${infer _Param}/${infer Rest}`
        ? _ReplacePathParams<`${Head}${string}/${Rest}`>
        : `${Head}${string}`
      : S

  type _NormalizeSlashes<S extends string> = S extends `${infer A}//${infer B}`
    ? _NormalizeSlashes<`${A}/${B}`>
    : S

  type _QuerySuffixUnion = "" | `?${string}`
  type _EmptyRecord = Record<never, never>

  // Join tails from two full route definitions: "&A&B" style or empty
  type _TailUnion<Src extends string, Suf extends string> = _NonEmpty<
    _SearchTail<Src>
  > extends infer TA
    ? _NonEmpty<_SearchTail<Suf>> extends infer TB
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
  export type OnlyIfNoParams<
    TParams extends object,
    Yes,
    No = never,
  > = keyof TParams extends never ? Yes : No

  export type OnlyIfHasParams<
    TParams extends object,
    Yes,
    No = never,
  > = keyof TParams extends never ? No : Yes

  export type PathDefinition<TFullPathDefinition extends string> =
    _TrimSearch<TFullPathDefinition>

  export type ParamsDefinition<TFullPathDefinition extends string> =
    _ExtractPathParams<PathDefinition<TFullPathDefinition>> extends infer U
      ? [U] extends [never]
        ? _EmptyRecord
        : { [K in Extract<U, string>]: true }
      : _EmptyRecord

  export type QueryDefinition<TFullPathDefinition extends string> = _NonEmpty<
    _SearchTail<TFullPathDefinition>
  > extends infer Tail extends string
    ? _AmpSplit<Tail> extends infer U
      ? [U] extends [never]
        ? _EmptyRecord
        : { [K in Extract<U, string>]: true }
      : _EmptyRecord
    : _EmptyRecord

  export type RouteDefinitionExtended<
    TSourceFullPathDefinition extends string,
    TSuffixFullPathDefinition extends string,
  > = `${_JoinPath<TSourceFullPathDefinition, TSuffixFullPathDefinition>}${_TailUnion<TSourceFullPathDefinition, TSuffixFullPathDefinition>}`

  export type ParamsInput<TParamsDefinition extends object> = {
    [K in keyof TParamsDefinition]: string | number | boolean
  }

  export type QueryInput<TQueryDefinition extends object> = Partial<{
    [K in keyof TQueryDefinition]:
      | string
      | number
      | boolean
      | Array<string | number | boolean>
  }> &
    Record<string, string | number | boolean | Array<string | number | boolean>>

  export type RouteValue<TFullPathDefinition extends string> =
    `${_ReplacePathParams<PathDefinition<TFullPathDefinition>>}${_QuerySuffixUnion}`

  export type AbsoluteRouteValue<TFullPathDefinition extends string> =
    `${string}${RouteValue<TFullPathDefinition>}`

  // Precise return types depending on presence of query in get() calls
  export type PathOnlyRouteValue<TFullPathDefinition extends string> =
    `${_ReplacePathParams<PathDefinition<TFullPathDefinition>>}`
  export type WithQueryRouteValue<TFullPathDefinition extends string> =
    `${_ReplacePathParams<PathDefinition<TFullPathDefinition>>}?${string}`
  export type AbsolutePathOnlyRouteValue<TFullPathDefinition extends string> =
    `${string}${PathOnlyRouteValue<TFullPathDefinition>}`
  export type AbsoluteWithQueryRouteValue<TFullPathDefinition extends string> =
    `${string}${WithQueryRouteValue<TFullPathDefinition>}`

  // ---------- Export helpers ----------
  export type ExtractParamsOutput<TRoute0 extends Route0<any, any, any, any>> =
    {
      [K in keyof TRoute0["paramsDefinition"]]: string
    }

  export type ExtractQueryOutput<TRoute0 extends Route0<any, any, any, any>> =
    Partial<
      {
        [K in keyof TRoute0["queryDefinition"]]: string
      } & Record<string, string>
    >
}
