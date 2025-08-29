export class Route0<
  TFullPathDefinition extends string,
  TPathDefinition extends Route0.PathDefinition<TFullPathDefinition>,
  TParamsDefinition extends
    | Route0.ParamsDefinition<TFullPathDefinition>
    | undefined,
  TSearchParamsDefinition extends
    | Route0.SearchParamsDefinition<TFullPathDefinition>
    | undefined,
> {
  fullPathDefinition: TFullPathDefinition
  pathDefinition: TPathDefinition
  paramsDefinition: TParamsDefinition
  searchParamsDefinition: TSearchParamsDefinition
  baseUrl: string

  private constructor(
    fullPathDefinition: TFullPathDefinition,
    baseUrl?: string,
  ) {
    this.fullPathDefinition = fullPathDefinition
    this.pathDefinition = Route0.getPathDefinition(
      fullPathDefinition,
    ) as TPathDefinition
    this.paramsDefinition = Route0.getParamsDefinitionByRouteDefinition(
      fullPathDefinition,
    ) as TParamsDefinition
    this.searchParamsDefinition =
      Route0.getSearchParamsDefinitionByRouteDefinition(
        fullPathDefinition,
      ) as TSearchParamsDefinition

    // determine base url
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
    TParamsDefinition extends
      | Route0.ParamsDefinition<TFullPathDefinition>
      | undefined,
    TSearchParamsDefinition extends
      | Route0.SearchParamsDefinition<TFullPathDefinition>
      | undefined,
  >(fullPathDefinition: TFullPathDefinition, baseUrl?: string) {
    return new Route0<
      TFullPathDefinition,
      TPathDefinition,
      TParamsDefinition,
      TSearchParamsDefinition
    >(fullPathDefinition, baseUrl)
  }

  // ---------- statics ----------

  private static _split(fullPathDefinition: string) {
    const i = fullPathDefinition.indexOf("&")
    if (i === -1) return { path: fullPathDefinition, searchTail: "" }
    return {
      path: fullPathDefinition.slice(0, i),
      searchTail: fullPathDefinition.slice(i + 1),
    }
  }

  private static _normalizeBase(base: string) {
    // drop trailing slashes
    return base.replace(/\/+$/, "")
  }

  // Collapse multiple slashes in the *path* part only
  private static _normalizeFullDefinition(full: string) {
    const i = full.indexOf("&")
    if (i === -1) return full.replace(/\/{2,}/g, "/")
    const path = full.slice(0, i).replace(/\/{2,}/g, "/")
    return path + full.slice(i) // keep search tail intact
  }

  private static _joinAbsolute(baseUrl: string, pathWithQuery: string) {
    const base = Route0._normalizeBase(baseUrl)
    const path = pathWithQuery.startsWith("/")
      ? pathWithQuery
      : `/${pathWithQuery}`
    return new URL(path, base + "/").toString().replace(/\/$/, "") // drop trailing slash if root
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
      Object.keys(out).length ? out : undefined
    ) as Route0.ParamsDefinition<TFullPathDefinition>
  }

  static getSearchParamsDefinitionByRouteDefinition<
    TFullPathDefinition extends string,
  >(fullPathDefinition: TFullPathDefinition) {
    const { searchTail } = Route0._split(fullPathDefinition)
    if (!searchTail)
      return undefined as Route0.SearchParamsDefinition<TFullPathDefinition>
    const out: Record<string, true> = {}
    for (const k of searchTail.split("&")) {
      if (!k) continue
      out[k] = true
    }
    return (
      Object.keys(out).length ? out : undefined
    ) as Route0.SearchParamsDefinition<TFullPathDefinition>
  }

  // ---------- instance API ----------

  extend<TSuffixDefinition extends string>(
    suffixDefinition: TSuffixDefinition,
  ) {
    // Normalize the concatenated path to avoid "//"
    const combined = `${this.pathDefinition}${suffixDefinition}`
    const normalized = Route0._normalizeFullDefinition(combined)

    const routeDefinition: Route0.RouteDefinitionExtended<
      TPathDefinition,
      TSuffixDefinition
    > = normalized as any

    return new Route0(routeDefinition, this.baseUrl)
  }

  // ===== OVERLOADS =====

  // no params
  get(): Route0.OnlyIfNoParams<
    TParamsDefinition,
    Route0.RouteValue<TFullPathDefinition>
  >
  get(
    search: Route0.OnlyIfNoParams<
      TParamsDefinition,
      Route0.SearchParamsInput<TSearchParamsDefinition>,
      never
    >,
  ): Route0.OnlyIfNoParams<
    TParamsDefinition,
    Route0.RouteValue<TFullPathDefinition>
  >
  get(props: {
    search?: Route0.OnlyIfNoParams<
      TParamsDefinition,
      Route0.SearchParamsInput<TSearchParamsDefinition>,
      never
    >
    abs?: false
  }): Route0.OnlyIfNoParams<
    TParamsDefinition,
    Route0.RouteValue<TFullPathDefinition>
  >
  get(props: {
    search?: Route0.OnlyIfNoParams<
      TParamsDefinition,
      Route0.SearchParamsInput<TSearchParamsDefinition>,
      never
    >
    abs: true
  }): Route0.OnlyIfNoParams<
    TParamsDefinition,
    Route0.AbsoluteRouteValue<TFullPathDefinition>
  >

  // with params
  get(
    params: Route0.ParamsInput<TParamsDefinition>,
    search?: Route0.SearchParamsInput<TSearchParamsDefinition>,
  ): Route0.RouteValue<TFullPathDefinition>
  get(props: {
    params: Route0.ParamsInput<TParamsDefinition>
    search?: Route0.SearchParamsInput<TSearchParamsDefinition>
    abs?: false
  }): Route0.RouteValue<TFullPathDefinition>
  get(props: {
    params: Route0.ParamsInput<TParamsDefinition>
    search?: Route0.SearchParamsInput<TSearchParamsDefinition>
    abs: true
  }): Route0.AbsoluteRouteValue<TFullPathDefinition>

  // Implementation
  get(
    a?:
      | Route0.ParamsInput<TParamsDefinition>
      | Route0.SearchParamsInput<TSearchParamsDefinition>
      | {
          params?: Route0.ParamsInput<TParamsDefinition>
          search?: Route0.SearchParamsInput<TSearchParamsDefinition>
          abs?: boolean
        },
    b?: Route0.SearchParamsInput<TSearchParamsDefinition>,
  ): string {
    // <-- explicit return type
    const isObj =
      typeof a === "object" &&
      a !== null &&
      ("params" in a || "search" in a || "abs" in a)

    let params = (isObj ? (a as any).params : a) as
      | Record<string, any>
      | undefined
    let search = (isObj ? (a as any).search : b) as
      | Record<string, any>
      | undefined
    const abs = isObj ? Boolean((a as any).abs) : false

    let url = String(this.pathDefinition)

    const needed = (
      this.paramsDefinition ? Object.keys(this.paramsDefinition) : []
    ) as string[]

    if (needed.length === 0 && !isObj && a !== undefined && b === undefined) {
      // single-arg call treated as search params when no path params
      search = a as any
      params = undefined
    }

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

    url = url.replace(/:([A-Za-z0-9_]+)/g, (_m, k) =>
      encodeURIComponent(String(params?.[k] ?? "")),
    )

    const allowedSearch = this.searchParamsDefinition
      ? new Set(Object.keys(this.searchParamsDefinition))
      : undefined

    if (search && Object.keys(search).length) {
      const parts: string[] = []
      for (const [k, v] of Object.entries(search)) {
        if (allowedSearch && !allowedSearch.has(k)) continue
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

    // Normalize any accidental double slashes in the final relative path
    url = url.replace(/\/{2,}/g, "/")

    const finalUrl = abs ? Route0._joinAbsolute(this.baseUrl, url) : url

    return finalUrl // <-- no conditional cast
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
  type _QuerySuffixUnion<T> = [T] extends [undefined] ? "" : "" | `?${string}`

  // normalize consecutive slashes at type level
  type _NormalizeSlashes<S extends string> = S extends `${infer A}//${infer B}`
    ? _NormalizeSlashes<`${A}/${B}`>
    : S

  // ---------- public types ----------
  export type OnlyIfNoParams<TParams, Yes, No = never> = [TParams] extends [
    undefined,
  ]
    ? Yes
    : No

  export type PathDefinition<TFullPathDefinition extends string> =
    _TrimSearch<TFullPathDefinition>

  export type ParamsDefinition<TFullPathDefinition extends string> =
    _ExtractPathParams<PathDefinition<TFullPathDefinition>> extends infer U
      ? [U] extends [never]
        ? undefined
        : { [K in Extract<U, string>]: true }
      : undefined

  export type SearchParamsDefinition<TFullPathDefinition extends string> =
    _NonEmpty<_SearchTail<TFullPathDefinition>> extends infer Tail extends
      string
      ? _AmpSplit<Tail> extends infer U
        ? [U] extends [never]
          ? undefined
          : { [K in Extract<U, string>]: true }
        : undefined
      : undefined

  export type RouteDefinitionExtended<
    TSourceFullPathDefinition extends string,
    TSuffixFullPathDefinition extends string,
  > = _NormalizeSlashes<`${PathDefinition<TSourceFullPathDefinition>}${TSuffixFullPathDefinition}`>

  export type ParamsInput<TParamsDefinition> = [TParamsDefinition] extends [
    undefined,
  ]
    ? undefined
    : {
        [K in keyof Extract<TParamsDefinition, object>]:
          | string
          | number
          | boolean
      }

  export type SearchParamsInput<TSearchParamsDefinition> = [
    TSearchParamsDefinition,
  ] extends [undefined]
    ? undefined
    : Partial<{
        [K in keyof Extract<TSearchParamsDefinition, object>]:
          | string
          | number
          | boolean
          | Array<string | number | boolean>
      }>

  // relative route literal with params replaced + optional query
  export type RouteValue<TFullPathDefinition extends string> =
    `${_ReplacePathParams<PathDefinition<TFullPathDefinition>>}${_QuerySuffixUnion<SearchParamsDefinition<TFullPathDefinition>>}`

  // absolute version (baseUrl unknown at type time, so prefix with string)
  export type AbsoluteRouteValue<TFullPathDefinition extends string> =
    `${string}${RouteValue<TFullPathDefinition>}`
}
