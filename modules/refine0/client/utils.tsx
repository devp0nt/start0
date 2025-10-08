/* eslint-disable max-lines */
import { refine0DataProvider } from '@devp0nt/refine0/client/data-provider'
import { jsToMeta, jsToRjsfUiSchema, type JsonSchema } from '@devp0nt/refine0/shared/utils'
import type { ResourceProps } from '@refinedev/core'
import { useResourceParams } from '@refinedev/core'
import type { GlobalUISchemaOptions } from '@rjsf/utils'
import axios, { type AxiosInstance } from 'axios'
import get from 'lodash/get'
import type { OpenAPI3, OperationObject } from 'openapi-typescript'
import { useEffect, useMemo } from 'react'
import * as zustand from 'zustand'

export type OpenapiSchema = OpenAPI3
export type OpenapiMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'
export type RefinUseResourceProps = Parameters<typeof useResourceParams>[0]
export const refineActions = ['list', 'create', 'show', 'edit', 'clone', 'delete'] as const
export type RefineAction = (typeof refineActions)[number]
export type RefineMeta = ResourceProps['meta']
export type Refine0ResourceAction = {
  method: OpenapiMethod
  path: string
  js: JsonSchema
}
export type Refine0Resource = {
  name: string
  meta: RefineMeta
  create?: Refine0ResourceAction | null
  edit?: Refine0ResourceAction | null
  show?: Refine0ResourceAction | null
  list?: Refine0ResourceAction | null
  delete?: Refine0ResourceAction | null
  clone?: Refine0ResourceAction | null
}
export type Refine0ResourceFullAction = {
  name: string
  meta: RefineMeta
  method: OpenapiMethod
  path: string
  js: JsonSchema
}
export type Refine0ResourceWithAction = Refine0Resource & Refine0ResourceAction

type OpenapiSchemaStoreNotReady = {
  openapiSchema: null
  resources: null
  isLoading: boolean
  isReady: boolean
  error: { message: string } | null
  // apiUrl: null
  openapiUrl: null
  apiPathPrefix: null
}
type OpenapiSchemaStoreReady = {
  openapiSchema: OpenapiSchema
  resources: Refine0Resource[]
  isLoading: boolean
  isReady: boolean
  error: null
  // apiUrl: string
  openapiUrl: string
  apiPathPrefix: string | null
}

export const createRefine0 = ({
  openapiUrl: defaultOpenapiUrl,
  apiUrl: defaultApiUrl,
  apiPathPrefix: defaultApiPathPrefix,
  routePathPrefix: defaultRoutePathPrefix,
  dataProviderName: defaultDataProviderName,
  httpClient: defaultHttpClient,
  Icon,
}: {
  openapiUrl: string
  apiUrl: string
  apiPathPrefix?: string
  routePathPrefix?: string
  dataProviderName?: string
  httpClient: AxiosInstance
  Icon?: React.FC<{
    icon: string
  }>
}) => {
  const useRefine0Store = zustand.create<
    (OpenapiSchemaStoreNotReady | OpenapiSchemaStoreReady) & {
      load: (props: { openapiUrl: string; apiPathPrefix?: string }) => Promise<void>
      refineResources: (props?: { dataProviderName?: string; routePathPrefix?: string }) => ResourceProps[]
      resourceAction: (props: { resource: string; action: RefineAction }) => Refine0ResourceAction | null
    }
  >((set, get) => ({
    openapiSchema: null,
    resources: null,
    apiPathPrefix: null,
    isReady: false,
    error: null,
    isLoading: false,
    openapiUrl: null,
    load: async ({ openapiUrl = defaultOpenapiUrl, apiPathPrefix: apiPathPrefixProvided = defaultApiPathPrefix }) => {
      set({ isLoading: true, isReady: false, error: null, openapiSchema: null, resources: null, openapiUrl: null })
      try {
        const res = await axios.get<OpenAPI3>(openapiUrl)
        const { openapiSchema, apiPathPrefix } = normalizeOpenapiSchemaPaths({
          openapiSchema: res.data,
          apiPathPrefix: apiPathPrefixProvided,
        })
        const resources = getRefine0Resources({ openapiSchema, apiPathPrefix })
        set({ isLoading: false, isReady: true, error: null, openapiSchema, resources, openapiUrl, apiPathPrefix })
      } catch (error) {
        set({
          isLoading: false,
          isReady: false,
          error: error instanceof Error ? { message: error.message } : { message: 'Unknown error' },
          openapiSchema: null,
          resources: null,
          openapiUrl: null,
          apiPathPrefix: null,
        })
      }
    },
    refineResources: (props = {}) => {
      const { dataProviderName = defaultDataProviderName, routePathPrefix = defaultRoutePathPrefix || '' } = props
      const refine0Resources = get().resources
      if (!refine0Resources) {
        return []
      }
      return refine0Resources.map((r0Resource) => ({
        name: r0Resource.name,
        list: r0Resource.list ? `${routePathPrefix}/${r0Resource.name}` : undefined,
        create: r0Resource.create ? `${routePathPrefix}/${r0Resource.name}/create` : undefined,
        edit: r0Resource.edit ? `${routePathPrefix}/${r0Resource.name}/edit/:id` : undefined,
        show: r0Resource.show ? `${routePathPrefix}/${r0Resource.name}/show/:id` : undefined,
        clone: r0Resource.clone ? `${routePathPrefix}/${r0Resource.name}/clone/:id` : undefined,
        meta: {
          ...r0Resource.meta,
          canDelete: !!r0Resource.delete,
          dataProviderName,
          icon:
            typeof r0Resource.meta?.icon === 'string' && Icon ? (
              <Icon icon={r0Resource.meta.icon} />
            ) : (
              r0Resource.meta?.icon
            ),
        },
      }))
    },
    resourceAction: ({ resource, action }) => {
      const refine0Resources = get().resources
      if (!refine0Resources) {
        return null
      }
      const refine0ResourceAction = refine0Resources.find((r0Resource) => r0Resource.name === resource)?.[action]
      if (!refine0ResourceAction) {
        return null
      }
      return refine0ResourceAction
    },
  }))

  const useRefine0RefineResources = ({
    dataProviderName,
    routePathPrefix,
  }: { dataProviderName?: string; routePathPrefix?: string } = {}) => {
    const refine0Resources = useRefine0Store((state) => state.resources)
    return useMemo(() => {
      return useRefine0Store.getState().refineResources({ dataProviderName, routePathPrefix })
    }, [refine0Resources, dataProviderName, routePathPrefix])
  }

  const useRefine0Resource = ({ resource: resourceProvided }: { resource?: string } = {}):
    | (Refine0Resource & { meta: RefineMeta | undefined })
    | null => {
    const refine0Resources = useRefine0Store((state) => state.resources)
    const { resource: refineResourceParams } = useResourceParams(
      resourceProvided ? { resource: resourceProvided } : undefined,
    )
    return useMemo(() => {
      if (!refine0Resources || !refineResourceParams) {
        return null
      }
      const refine0Resource = refine0Resources.find((r0Resource) => r0Resource.name === refineResourceParams.name)
      if (!refine0Resource) {
        return null
      }
      return { ...refine0Resource, meta: refineResourceParams.meta }
    }, [refine0Resources, refineResourceParams])
  }

  const useRefine0Action = ({
    resource: resourceProvided,
    action: actionProvided,
  }: { resource?: string; action?: RefineAction } = {}): Refine0ResourceFullAction | null => {
    const refine0Resources = useRefine0Store((state) => state.resources)
    const { resource: refineResourceParams, action } = useResourceParams(
      resourceProvided && actionProvided !== 'delete'
        ? { resource: resourceProvided, action: actionProvided }
        : undefined,
    )
    return useMemo(() => {
      if (!refine0Resources || !refineResourceParams || !action) {
        return null
      }
      const refine0ResourceAction = useRefine0Store
        .getState()
        .resourceAction({ resource: refineResourceParams.name, action })
      if (!refine0ResourceAction) {
        return null
      }
      return { ...refine0ResourceAction, meta: refineResourceParams.meta, name: refineResourceParams.name }
    }, [refine0Resources, refineResourceParams, action])
  }

  const useRefine0ResourceWithAction = ({
    resource: resourceProvided,
    action: actionProvided,
  }: { resource?: string; action?: RefineAction } = {}): Refine0ResourceWithAction | null => {
    const refine0Resources = useRefine0Store((state) => state.resources)
    const { resource: refineResourceParams, action } = useResourceParams(
      resourceProvided && actionProvided !== 'delete'
        ? { resource: resourceProvided, action: actionProvided }
        : undefined,
    )
    return useMemo(() => {
      if (!refine0Resources || !refineResourceParams || !action) {
        return null
      }
      const refine0Resource = refine0Resources.find((r0Resource) => r0Resource.name === refineResourceParams.name)
      if (!refine0Resource) {
        return null
      }
      const refine0ResourceAction = useRefine0Store
        .getState()
        .resourceAction({ resource: refineResourceParams.name, action })
      if (!refine0ResourceAction) {
        return null
      }
      return { ...refine0Resource, ...refine0ResourceAction, meta: refineResourceParams.meta }
    }, [refine0Resources, refineResourceParams, action])
  }

  const Refine0Provider = ({
    openapiUrl = defaultOpenapiUrl,
    children,
    Loader,
    Error,
  }: {
    openapiUrl?: string
    children: React.ReactNode
    Loader: React.ReactNode
    Error: React.FC<{ message?: string }>
  }) => {
    const { error, isLoading, load } = useRefine0Store()
    useEffect(() => {
      void load({ openapiUrl })
    }, [openapiUrl])
    return <>{isLoading ? Loader : error ? <Error message={error.message || 'Unknown error'} /> : children}</>
  }

  return {
    useRefine0Store,
    useRefine0RefineResources,
    useRefine0Resource,
    useRefine0Action,
    useRefine0ResourceWithAction,
    Refine0Provider,
    dataProvider: refine0DataProvider({
      apiUrl: defaultApiUrl,
      httpClient: defaultHttpClient,
      getResourceAction: (props) => {
        return useRefine0Store.getState().resourceAction({ resource: props.resource, action: props.action })
      },
    }),
  }
}

export type CreateRefine0Result = ReturnType<typeof createRefine0>

export const useRjsfUiSchema = ({
  js,
  scope,
  globalOptions,
}: {
  js: JsonSchema | null
  scope?: string | string[]
  globalOptions?: GlobalUISchemaOptions
}) => {
  return useMemo(() => {
    return jsToRjsfUiSchema({ js, scope, globalOptions })
  }, [js, scope, globalOptions])
}

export const normalizeOpenapiSchemaPaths = ({
  openapiSchema,
  apiPathPrefix: providedApiPathPrefix,
}: {
  openapiSchema: OpenapiSchema
  apiPathPrefix?: string
}): { openapiSchema: OpenapiSchema; apiPathPrefix: string | null } => {
  const apiPathPrefix = providedApiPathPrefix || openapiSchema.servers?.[0]?.url || null
  if (!apiPathPrefix || !openapiSchema.paths) {
    return { openapiSchema, apiPathPrefix }
  }
  return {
    openapiSchema: {
      ...openapiSchema,
      paths: Object.fromEntries(
        Object.entries(openapiSchema.paths).map(([path, value]) => [apiPathPrefix + path, value]),
      ),
    },
    apiPathPrefix,
  }
}

export const getAnyRefine0ResourceAction = ({
  openapiSchema,
  path,
  method: methodProvided,
  type,
}: {
  openapiSchema: OpenapiSchema
  path: string
  method?: OpenapiMethod
  type: 'res' | 'req'
}): Refine0ResourceAction | null => {
  const { method, operationObject } = (():
    | {
        method: OpenapiMethod
        operationObject: OperationObject
      }
    | {
        method: undefined
        operationObject: undefined
      } => {
    if (methodProvided) {
      return { method: methodProvided, operationObject: get(openapiSchema, ['paths', path, methodProvided]) }
    } else {
      const methods = get(openapiSchema, ['paths', path], {})
      const methodsKeys = Object.keys(methods)
      if (methodsKeys.length > 0) {
        return {
          method: methodsKeys[0] as OpenapiMethod,
          operationObject: methods[methodsKeys[0] as keyof typeof methods],
        }
      } else {
        return { method: undefined, operationObject: undefined }
      }
    }
  })()
  if (!operationObject) {
    return null
  }
  if (type === 'res') {
    const js = get(
      operationObject,
      ['responses', '200', 'content', 'application/json', 'schema', 'properties', 'data'],
      null,
    )
    if (!js) {
      return null
    }
    if (js.type === 'array') {
      return { method, js: js.items as JsonSchema, path }
    } else {
      return { method, js: js as JsonSchema, path }
    }
  } else {
    const js = (() => {
      if (method === 'get' || method === 'delete') {
        // For GET and DELETE requests, get query parameters schema
        return get(operationObject, ['request', 'query'], null)
      } else {
        // For POST and PUT requests, get request body schema
        return get(
          operationObject,
          ['requestBody', 'content', 'application/json', 'schema', 'properties', 'data'],
          null,
        )
      }
    })()
    if (!js) {
      return null
    }
    return { method, js: js as JsonSchema, path }
  }
}

export const getRefine0ResourceAction = ({
  openapiSchema,
  resource,
  action,
  apiPathPrefix,
}: {
  openapiSchema: OpenapiSchema | null
  resource: string
  action: 'list' | 'create' | 'show' | 'edit' | 'clone' | 'delete'
  apiPathPrefix?: string | null
}): Refine0ResourceAction | null => {
  if (!resource || !openapiSchema) {
    return null
  }
  const { path, type } = ((): {
    path: string
    type: 'res' | 'req'
  } => {
    const fullPathPrefix = [apiPathPrefix, resource].filter(Boolean).join('/')
    if (action === 'list') {
      return { path: `${fullPathPrefix}/list`, type: 'res' }
    } else if (action === 'create') {
      return { path: `${fullPathPrefix}/create`, type: 'req' }
    } else if (action === 'show') {
      return { path: `${fullPathPrefix}/show`, type: 'res' }
    } else if (action === 'edit') {
      return { path: `${fullPathPrefix}/edit`, type: 'req' }
    } else if (action === 'delete') {
      return { path: `${fullPathPrefix}/delete`, type: 'res' }
    } else {
      return { path: `${fullPathPrefix}/show`, type: 'res' }
    }
  })()
  return getAnyRefine0ResourceAction({
    openapiSchema,
    path,
    type,
  })
}

export const getRefine0Resources = ({
  openapiSchema,
  apiPathPrefix,
}: {
  openapiSchema: OpenapiSchema
  apiPathPrefix: string | null
}): Refine0Resource[] => {
  const refine0Resources: Refine0Resource[] = []
  if (!openapiSchema.paths) {
    return []
  }
  for (const path of Object.keys(openapiSchema.paths)) {
    if (apiPathPrefix && !path.startsWith(apiPathPrefix)) {
      continue
    }
    const pathWithoutPathPrefix = apiPathPrefix ? path.replace(apiPathPrefix, '') : path
    const resource = pathWithoutPathPrefix.split('/')[1]
    if (!resource) {
      continue
    }
    const action = pathWithoutPathPrefix.split('/')[2] as RefineAction
    if (!refineActions.includes(action)) {
      continue
    }
    const refine0ResourceAction = getRefine0ResourceAction({
      openapiSchema,
      resource,
      action,
      apiPathPrefix,
    })
    if (!refine0ResourceAction) {
      continue
    }
    const exRefine0Resource = refine0Resources.find((exR0Resource) => exR0Resource.name === resource)
    if (exRefine0Resource) {
      exRefine0Resource[action] = refine0ResourceAction
      exRefine0Resource.meta = { ...exRefine0Resource.meta, ...jsToMeta(refine0ResourceAction.js) }
    } else {
      refine0Resources.push({
        name: resource,
        meta: jsToMeta(refine0ResourceAction.js),
        [action]: refine0ResourceAction,
      })
    }
  }
  return refine0Resources
}
