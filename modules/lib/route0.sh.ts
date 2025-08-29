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

  private constructor(fullPathDefinition: TFullPathDefinition) {
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
  >(fullPathDefinition: TFullPathDefinition) {
    return new Route0<
      TFullPathDefinition,
      TPathDefinition,
      TParamsDefinition,
      TSearchParamsDefinition
    >(fullPathDefinition)
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

  // Collapse multiple slashes in the *path* part only
  private static _normalizeFullDefinition(full: string) {
    const i = full.indexOf("&")
    if (i === -1) return full.replace(/\/{2,}/g, "/")
    const path = full.slice(0, i).replace(/\/{2,}/g, "/")
    return path + full.slice(i) // keep search tail intact
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

    return new Route0(routeDefinition)
  }

  // ===== OVERLOADS (as in your version) =====

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
  }): Route0.OnlyIfNoParams<
    TParamsDefinition,
    Route0.RouteValue<TFullPathDefinition>
  >
  get(
    params: Route0.ParamsInput<TParamsDefinition>,
    search?: Route0.SearchParamsInput<TSearchParamsDefinition>,
  ): Route0.RouteValue<TFullPathDefinition>
  get(props: {
    params: Route0.ParamsInput<TParamsDefinition>
    search?: Route0.SearchParamsInput<TSearchParamsDefinition>
  }): Route0.RouteValue<TFullPathDefinition>

  // Implementation
  get(
    a?:
      | Route0.ParamsInput<TParamsDefinition>
      | Route0.SearchParamsInput<TSearchParamsDefinition>
      | {
          params?: Route0.ParamsInput<TParamsDefinition>
          search?: Route0.SearchParamsInput<TSearchParamsDefinition>
        },
    b?: Route0.SearchParamsInput<TSearchParamsDefinition>,
  ) {
    const isObj =
      typeof a === "object" && a !== null && ("params" in a || "search" in a)

    let params = (isObj ? (a as any).params : a) as
      | Record<string, any>
      | undefined
    let search = (isObj ? (a as any).search : b) as
      | Record<string, any>
      | undefined

    let url = String(this.pathDefinition)

    const needed = (
      this.paramsDefinition ? Object.keys(this.paramsDefinition) : []
    ) as string[]

    if (needed.length === 0 && !isObj && a !== undefined && b === undefined) {
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

    // Normalize again in case params introduced '//' (unlikely but safe)
    url = url.replace(/\/{2,}/g, "/")

    return url as Route0.RouteValue<TFullPathDefinition>
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

  // NEW: normalize consecutive slashes at type level
  type _NormalizeSlashes<S extends string> = S extends `${infer A}//${infer B}`
    ? _NormalizeSlashes<`${A}/${B}`>
    : S

  // Conditional “presence” helper
  export type OnlyIfNoParams<TParams, Yes, No = never> = [TParams] extends [
    undefined,
  ]
    ? Yes
    : No

  // ---------- public types ----------
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

  // Use normalized slashes in the extended definition type
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

  // RouteValue keeps param literals and optional query
  export type RouteValue<TFullPathDefinition extends string> =
    `${_ReplacePathParams<PathDefinition<TFullPathDefinition>>}${_QuerySuffixUnion<SearchParamsDefinition<TFullPathDefinition>>}`
}
