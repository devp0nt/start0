// TODO: refactor types
// TODO: use in react router
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
  TPathDefinition extends _PathDefinition<TPathOriginalDefinition>,
  TParamsDefinition extends _ParamsDefinition<TPathOriginalDefinition>,
  TQueryDefinition extends _QueryDefinition<TPathOriginalDefinition>,
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
    TPathDefinition extends _PathDefinition<TPathOriginalDefinition>,
    TParamsDefinition extends _ParamsDefinition<TPathOriginalDefinition>,
    TQueryDefinition extends _QueryDefinition<TPathOriginalDefinition>,
  >(definition: TPathOriginalDefinition, config?: Route0.RouteConfigInput) {
    return new Route0<TPathOriginalDefinition, TPathDefinition, TParamsDefinition, TQueryDefinition>(definition, config)
  }

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
    return pathDefinition as _PathDefinition<TPathOriginalDefinition>
  }

  private static _getParamsDefinitionByRouteDefinition<TPathOriginalDefinition extends string>(
    pathOriginalDefinition: TPathOriginalDefinition,
  ) {
    const { pathDefinition } = Route0._splitPathDefinitionAndQueryTailDefinition(pathOriginalDefinition)
    const matches = Array.from(pathDefinition.matchAll(/:([A-Za-z0-9_]+)/g))
    const paramsDefinition = Object.fromEntries(matches.map((m) => [m[1], true]))
    return paramsDefinition as _ParamsDefinition<TPathOriginalDefinition>
  }

  private static _getQueryDefinitionByRouteDefinition<TPathOriginalDefinition extends string>(
    pathOriginalDefinition: TPathOriginalDefinition,
  ) {
    const { queryTailDefinition } = Route0._splitPathDefinitionAndQueryTailDefinition(pathOriginalDefinition)
    if (!queryTailDefinition) {
      return {} as _QueryDefinition<TPathOriginalDefinition>
    }
    const keys = queryTailDefinition.split("&").map(Boolean)
    const queryDefinition = Object.fromEntries(keys.map((k) => [k, true]))
    return queryDefinition as _QueryDefinition<TPathOriginalDefinition>
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
    _RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>,
    _PathDefinition<_RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
    _ParamsDefinition<_RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
    _QueryDefinition<_RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>
  > {
    const { pathDefinition: parentPathDefinition } = Route0._splitPathDefinitionAndQueryTailDefinition(
      this.pathOriginalDefinition,
    )
    const { pathDefinition: suffixPathDefinition, queryTailDefinition: suffixQueryTailDefinition } =
      Route0._splitPathDefinitionAndQueryTailDefinition(suffixDefinition)
    const pathDefinition = `${parentPathDefinition}/${suffixPathDefinition}`.replace(/\/{2,}/g, "/")
    const pathOriginalDefinition =
      `${pathDefinition}${suffixQueryTailDefinition}` as _RoutePathOriginalDefinitionExtended<
        TPathOriginalDefinition,
        TSuffixDefinition
      >
    return new Route0<
      _RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>,
      _PathDefinition<_RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
      _ParamsDefinition<_RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>,
      _QueryDefinition<_RoutePathOriginalDefinitionExtended<TPathOriginalDefinition, TSuffixDefinition>>
    >(pathOriginalDefinition, { baseUrl: this.baseUrl })
  }

  // has params
  get(
    input: _OnlyIfHasParams<TParamsDefinition, _WithParamsInput<TParamsDefinition, { query?: undefined; abs?: false }>>,
  ): _OnlyIfHasParams<TParamsDefinition, _PathOnlyRouteValue<TPathOriginalDefinition>>
  get(
    input: _OnlyIfHasParams<
      TParamsDefinition,
      _WithParamsInput<TParamsDefinition, { query: _QueryInput<TQueryDefinition>; abs?: false }>
    >,
  ): _OnlyIfHasParams<TParamsDefinition, _WithQueryRouteValue<TPathOriginalDefinition>>
  get(
    input: _OnlyIfHasParams<TParamsDefinition, _WithParamsInput<TParamsDefinition, { query?: undefined; abs: true }>>,
  ): _OnlyIfHasParams<TParamsDefinition, _AbsolutePathOnlyRouteValue<TPathOriginalDefinition>>
  get(
    input: _OnlyIfHasParams<
      TParamsDefinition,
      _WithParamsInput<TParamsDefinition, { query: _QueryInput<TQueryDefinition>; abs: true }>
    >,
  ): _OnlyIfHasParams<TParamsDefinition, _AbsoluteWithQueryRouteValue<TPathOriginalDefinition>>

  // no params
  get(...args: _OnlyIfNoParams<TParamsDefinition, [], [never]>): _PathOnlyRouteValue<TPathOriginalDefinition>
  get(
    input: _OnlyIfNoParams<TParamsDefinition, { query?: undefined; abs?: false }>,
  ): _OnlyIfNoParams<TParamsDefinition, _PathOnlyRouteValue<TPathOriginalDefinition>>
  get(
    input: _OnlyIfNoParams<TParamsDefinition, { query: _QueryInput<TQueryDefinition>; abs?: false }>,
  ): _OnlyIfNoParams<TParamsDefinition, _WithQueryRouteValue<TPathOriginalDefinition>>
  get(
    input: _OnlyIfNoParams<TParamsDefinition, { query?: undefined; abs: true }>,
  ): _OnlyIfNoParams<TParamsDefinition, _AbsolutePathOnlyRouteValue<TPathOriginalDefinition>>
  get(
    input: _OnlyIfNoParams<TParamsDefinition, { query: _QueryInput<TQueryDefinition>; abs: true }>,
  ): _OnlyIfNoParams<TParamsDefinition, _AbsoluteWithQueryRouteValue<TPathOriginalDefinition>>

  // implementation
  get(...args: any[]): string {
    const { queryInput, paramsInput, absInput } = ((): {
      queryInput: Record<string, string | number>
      paramsInput: Record<string, string | number>
      absInput: boolean
    } => {
      if (args.length === 0) {
        return { queryInput: {}, paramsInput: {}, absInput: false }
      }
      const input = args[0]
      if (typeof input !== "object" || input === null) {
        // throw new Error("Invalid get route input: expected object")
        return { queryInput: {}, paramsInput: {}, absInput: false }
      }
      const { query, abs, ...params } = input
      return { queryInput: query || {}, paramsInput: params || {}, absInput: abs ?? false }
    })()

    // validate params
    const neededParamsKeys = Object.keys(this.paramsDefinition)
    const providedParamsKeys = Object.keys(paramsInput)
    const notProvidedKeys = neededParamsKeys.filter((k) => !providedParamsKeys.includes(k))
    if (notProvidedKeys.length) {
      // throw new Error(`Missing params: not defined keys ${notProvidedKeys.map((k) => `"${k}"`).join(", ")}.`)
      Object.assign(paramsInput, Object.fromEntries(notProvidedKeys.map((k) => [k, "undefined"])))
    }

    // create url
    let url = String(this.pathDefinition)
    // replace params
    url = url.replace(/:([A-Za-z0-9_]+)/g, (_m, k) => encodeURIComponent(String(paramsInput?.[k] ?? "")))
    // query params
    const queryInputStringified = Object.fromEntries(Object.entries(queryInput).map(([k, v]) => [k, String(v)]))
    url = [url, new URLSearchParams(queryInputStringified).toString()].filter(Boolean).join("?")
    // dedupe slashes
    url = url.replace(/\/{2,}/g, "/")
    // absolute
    url = absInput ? Route0._getAbsPath(this.baseUrl, url) : url

    return url
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
}

type _TrimQueryTailDefinition<S extends string> = S extends `${infer P}&${string}` ? P : S
type _QueryTailDefinitionWithoutFirstAmp<S extends string> = S extends `${string}&${infer T}` ? T : ""
type _QueryTailDefinitionWithFirstAmp<S extends string> = S extends ""
  ? ""
  : `&${_QueryTailDefinitionWithoutFirstAmp<S>}`
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

type _OnlyIfNoParams<TParams extends object, Yes, No = never> = keyof TParams extends never ? Yes : No
type _OnlyIfHasParams<TParams extends object, Yes, No = never> = keyof TParams extends never ? No : Yes

type _PathDefinition<TPathOriginalDefinition extends string> = _TrimQueryTailDefinition<TPathOriginalDefinition>
type _ParamsDefinition<TPathOriginalDefinition extends string> = _ExtractPathParams<
  _PathDefinition<TPathOriginalDefinition>
> extends infer U
  ? [U] extends [never]
    ? _EmptyRecord
    : { [K in Extract<U, string>]: true }
  : _EmptyRecord
type _QueryDefinition<TPathOriginalDefinition extends string> = _NonEmpty<
  _QueryTailDefinitionWithoutFirstAmp<TPathOriginalDefinition>
> extends infer Tail extends string
  ? _AmpSplit<Tail> extends infer U
    ? [U] extends [never]
      ? _EmptyRecord
      : { [K in Extract<U, string>]: true }
    : _EmptyRecord
  : _EmptyRecord
type _RoutePathOriginalDefinitionExtended<
  TSourcePathOriginalDefinition extends string,
  TSuffixPathOriginalDefinition extends string,
> = `${_JoinPath<TSourcePathOriginalDefinition, TSuffixPathOriginalDefinition>}${_QueryTailDefinitionWithFirstAmp<TSuffixPathOriginalDefinition>}`

type _ParamsInput<TParamsDefinition extends object> = {
  [K in keyof TParamsDefinition]: string | number
}
type _QueryInput<TQueryDefinition extends object> = Partial<{
  [K in keyof TQueryDefinition]: string | number
}> &
  Record<string, string | number>
type _WithParamsInput<
  TParamsDefinition extends object,
  T extends {
    query?: _QueryInput<any>
    abs?: boolean
  },
> = _ParamsInput<TParamsDefinition> & T

type _PathOnlyRouteValue<TPathOriginalDefinition extends string> =
  `${_ReplacePathParams<_PathDefinition<TPathOriginalDefinition>>}`
type _WithQueryRouteValue<TPathOriginalDefinition extends string> =
  `${_ReplacePathParams<_PathDefinition<TPathOriginalDefinition>>}?${string}`
type _AbsolutePathOnlyRouteValue<TPathOriginalDefinition extends string> =
  `${string}${_PathOnlyRouteValue<TPathOriginalDefinition>}`
type _AbsoluteWithQueryRouteValue<TPathOriginalDefinition extends string> =
  `${string}${_WithQueryRouteValue<TPathOriginalDefinition>}`
