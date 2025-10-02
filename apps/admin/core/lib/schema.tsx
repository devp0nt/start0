import { AdminCtx } from '@admin/core/lib/ctx'
import { InfoCircleOutlined } from '@ant-design/icons'
import type { JsonSchema } from '@apps/shared/json'
import { useResourceParams } from '@refinedev/core'
import axios from 'axios'
import { uniq } from 'lodash'
import get from 'lodash/get'
import type { OpenAPI3 } from 'openapi-typescript'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type OpenapiSchema = OpenAPI3

type OpenapiSchemaLoaderResult =
  | {
      isLoading: true
      schema: null
      error: null
      reload: () => Promise<void>
    }
  | {
      isLoading: false
      schema: OpenapiSchema
      error: null
      reload: () => Promise<void>
    }
  | {
      isLoading: false
      schema: null
      error: { message: string }
      reload: () => Promise<void>
    }

export const useOpenapiSchemaLoader = ({ url }: { url: string }): OpenapiSchemaLoaderResult => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<{ message: string } | null>(null)
  const [schema, setSchema] = useState<OpenapiSchema | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      setSchema(null)
      setIsLoading(true)
      const res = await axios.get<OpenAPI3>(url)
      setError(null)
      setSchema(normalizeOpenapiSchemaPaths(res.data))
      setIsLoading(false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setError(error instanceof Error ? { message: error.message } : { message: 'Unknown error' })
      setSchema(null)
      setIsLoading(false)
    }
  }, [url])

  useEffect(() => {
    void reload()
  }, [])

  return { isLoading, schema, error, reload } as OpenapiSchemaLoaderResult
}

const normalizeOpenapiSchemaPaths = (openapiSchema: OpenapiSchema) => {
  const serverUrl = openapiSchema.servers?.[0]?.url
  if (!serverUrl || !openapiSchema.paths) {
    return openapiSchema
  }
  return {
    ...openapiSchema,
    paths: Object.fromEntries(Object.entries(openapiSchema.paths).map(([path, value]) => [serverUrl + path, value])),
  }
}

export type OpenapiSchemaResult =
  | {
      schema: JsonSchema
      error: null
    }
  | {
      schema: null
      error: { message: string }
    }
export const getAnyResourceSchema = ({
  openapiSchema,
  path,
  method,
  type,
}: {
  openapiSchema: OpenapiSchema
  path: string
  method: 'get' | 'post' | 'put' | 'delete'
  type: 'res' | 'req'
}): JsonSchema | null => {
  const operationObject = get(openapiSchema, ['paths', path, method])
  if (!operationObject) {
    return null
  }
  if (type === 'res') {
    const schema = get(
      operationObject,
      ['responses', '200', 'content', 'application/json', 'schema', 'properties', 'data'],
      null,
    )
    if (!schema) {
      return null
    }
    if (schema.type === 'array') {
      return schema.items as JsonSchema
    } else {
      return schema as JsonSchema
    }
  } else {
    const schema = get(
      operationObject,
      ['requestBody', 'content', 'application/json', 'schema', 'properties', 'data'],
      null,
    )
    if (!schema) {
      return null
    }
    return schema as JsonSchema
  }
}
export const getResourceSchema = ({
  openapiSchema,
  resource,
  action,
  routePrefix,
}: {
  openapiSchema: OpenapiSchema
  resource: string
  action: 'list' | 'create' | 'show' | 'edit' | 'clone' | 'delete'
  routePrefix: string
}): JsonSchema | null => {
  if (!resource) {
    return null
  }
  const { path, method, type } = ((): {
    path: string
    method: 'get' | 'post' | 'put' | 'delete'
    type: 'res' | 'req'
  } => {
    const fullPathPrefix = `${routePrefix}/${resource}`
    if (action === 'list') {
      return { path: `${fullPathPrefix}/list`, method: 'post', type: 'res' }
    } else if (action === 'create') {
      return { path: `${fullPathPrefix}/create`, method: 'post', type: 'req' }
    } else if (action === 'show') {
      return { path: `${fullPathPrefix}/get`, method: 'get', type: 'res' }
    } else if (action === 'edit') {
      return { path: `${fullPathPrefix}/update`, method: 'post', type: 'req' }
    } else if (action === 'delete') {
      return { path: `${fullPathPrefix}/delete`, method: 'post', type: 'res' }
    } else {
      return { path: `${fullPathPrefix}/get`, method: 'get', type: 'res' }
    }
  })()
  const schema = getAnyResourceSchema({
    openapiSchema,
    path,
    method,
    type,
  })
  return schema
}

export const useResourceSchema = (): JsonSchema | null => {
  const openapiSchema = AdminCtx.useOpenapiSchema()
  const { resource, action } = useResourceParams()
  const routePrefix = resource?.meta?.routePrefix as string
  return useMemo(() => {
    return resource && action
      ? getResourceSchema({ openapiSchema, resource: resource.name, action, routePrefix })
      : null
  }, [resource])
}

export const getResourceAbilities = ({
  resource,
  openapiSchema,
  routePrefix,
}: {
  resource: string
  openapiSchema: OpenapiSchema | null
  routePrefix: string
}) => {
  if (!openapiSchema) {
    return {
      creatable: false,
      editable: false,
      showable: false,
      listable: false,
      deleteable: false,
    }
  }
  const createSchema = getResourceSchema({ openapiSchema, resource, action: 'create', routePrefix })
  const editSchema = getResourceSchema({ openapiSchema, resource, action: 'edit', routePrefix })
  const showSchema = getResourceSchema({ openapiSchema, resource, action: 'show', routePrefix })
  const listSchema = getResourceSchema({ openapiSchema, resource, action: 'list', routePrefix })
  const deleteSchema = getResourceSchema({ openapiSchema, resource, action: 'delete', routePrefix })
  return {
    creatable: !!createSchema,
    editable: !!editSchema,
    showable: !!showSchema,
    listable: !!listSchema,
    deleteable: !!deleteSchema,
  }
}

export const useAnyResourceAbilities = ({
  resource,
  routePrefix,
}: {
  resource: string | undefined
  routePrefix: string
}) => {
  const openapiSchema = AdminCtx.useOpenapiSchema()
  return useMemo(() => {
    return resource
      ? getResourceAbilities({ resource, openapiSchema, routePrefix })
      : {
          creatable: false,
          editable: false,
          showable: false,
          listable: false,
          deleteable: false,
        }
  }, [resource])
}

export const useResourceAbilities = () => {
  const { resource } = useResourceParams()
  const routePrefix = resource?.meta?.routePrefix as string
  return useAnyResourceAbilities({ resource: resource?.name, routePrefix })
}

export const getResourcesNames = ({
  openapiSchema,
  routePrefix,
}: {
  openapiSchema: OpenapiSchema | null
  routePrefix: string
}) => {
  if (!openapiSchema) {
    return []
  }
  if (!openapiSchema.paths) {
    return []
  }
  const pathsKeys = Object.keys(openapiSchema.paths)
  return uniq(
    pathsKeys
      .filter(
        (path) =>
          path.startsWith(routePrefix) &&
          (path.endsWith('/list') ||
            path.endsWith('/create') ||
            path.endsWith('/get') ||
            path.endsWith('/update') ||
            path.endsWith('/delete')),
      )
      .map((path) => path.replace(routePrefix, '').split('/')[1]),
  )
}

export const getResourcesAbilities = ({
  openapiSchema,
  routePrefix,
}: {
  openapiSchema: OpenapiSchema | null
  routePrefix: string
}) => {
  if (!openapiSchema) {
    return []
  }
  const resourcesNames = getResourcesNames({ openapiSchema, routePrefix })
  return resourcesNames.map((resource) => {
    return { name: resource, ...getResourceAbilities({ resource, openapiSchema, routePrefix }) }
  })
}
export type ResourcesAbilities = ReturnType<typeof getResourcesAbilities>

export const useResourcesAbilities = ({ routePrefix }: { routePrefix: string }) => {
  const openapiSchema = AdminCtx.useOpenapiSchema()
  console.log('openapiSchema', openapiSchema)
  return useMemo(() => {
    return getResourcesAbilities({ openapiSchema, routePrefix })
  }, [openapiSchema, routePrefix])
}

export const resourcesAbilitiesToRefineResources = ({
  abilities,
  routePrefix,
  hide,
}: {
  abilities: ResourcesAbilities
  routePrefix: string
  hide?: boolean
}) => {
  return abilities.map((resource) => ({
    name: resource.name,
    list: resource.listable ? `/${resource.name}` : undefined,
    create: resource.creatable ? `/${resource.name}/create` : undefined,
    edit: resource.editable ? `/${resource.name}/edit/:id` : undefined,
    show: resource.showable ? `/${resource.name}/show/:id` : undefined,
    meta: {
      canDelete: resource.deleteable,
      routePrefix,
      hide,
      icon: <InfoCircleOutlined />,
    },
  }))
}

export type RefineResources = ReturnType<typeof resourcesAbilitiesToRefineResources>

export const useRefineResources = ({ routePrefix }: { routePrefix: string }): RefineResources => {
  const abilities = useResourcesAbilities({ routePrefix })
  return useMemo(() => {
    return resourcesAbilitiesToRefineResources({
      abilities,
      routePrefix,
    })
  }, [abilities, routePrefix])
}
