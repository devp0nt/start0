import {
  getRefineRoutesHelpers,
  type ResourcePathWithMethod,
  type ResourceAction,
  type ResourceRoutePathWithMethodAnyInput,
  type ResourceMethod,
} from './utils.be'

type ResourceMetaAnyInput = ResourceRoutePathWithMethodAnyInput
type ResourceTrpcMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type ReourceMethodToTrpcMethod<TMethod extends ResourceMethod> = TMethod extends 'get'
  ? 'GET'
  : TMethod extends 'post'
    ? 'POST'
    : TMethod extends 'put'
      ? 'PUT'
      : 'DELETE'
type ResourceTrpcMeta<TTrpcMethod extends ResourceTrpcMethod = ResourceTrpcMethod> = {
  openapi: {
    method: TTrpcMethod
    path: `/${string}`
  }
}

export const getTrpcRefineRoutesHelpers = ({
  prefix: defaultPrefix = '',
  resource: defaultResource,
}: {
  prefix?: string
  resource: string
}) => {
  const helpers = getRefineRoutesHelpers({
    prefix: defaultPrefix,
    resource: defaultResource,
  })
  const { getPathWithMethod } = helpers

  const pathWithMethodToMeta = <TMethod extends ResourceMethod>(
    pathWithMeta: ResourcePathWithMethod<TMethod>,
  ): ResourceTrpcMeta<ReourceMethodToTrpcMethod<TMethod>> => {
    return {
      openapi: {
        method: pathWithMeta.method.toUpperCase() as ReourceMethodToTrpcMethod<TMethod>,
        path: pathWithMeta.path,
      },
    }
  }
  const getResourceMetaAny = ({ resource, prefix, suffix, method, path }: ResourceMetaAnyInput) => {
    return pathWithMethodToMeta(getPathWithMethod.any({ resource, prefix, suffix, method, path }))
  }
  const getResourceListMeta = (resource?: string) => {
    return pathWithMethodToMeta(getPathWithMethod.list(resource))
  }
  const getResourceCreateMeta = (resource?: string) => {
    return pathWithMethodToMeta(getPathWithMethod.create(resource))
  }
  const getResourceUpdateMeta = (resource?: string) => {
    return pathWithMethodToMeta(getPathWithMethod.update(resource))
  }
  const getResourceGetMeta = (resource?: string) => {
    return pathWithMethodToMeta(getPathWithMethod.get(resource))
  }
  const getResourceDeleteMeta = (resource?: string) => {
    return pathWithMethodToMeta(getPathWithMethod.delete(resource))
  }
  const getResourceMeta = (action: ResourceAction, resource?: string) => {
    return {
      list: getResourceListMeta(resource),
      create: getResourceCreateMeta(resource),
      get: getResourceGetMeta(resource),
      update: getResourceUpdateMeta(resource),
      delete: getResourceDeleteMeta(resource),
    }[action]
  }
  const getMeta = {
    any: getResourceMetaAny,
    special: getResourceMeta,
    list: getResourceListMeta,
    create: getResourceCreateMeta,
    update: getResourceUpdateMeta,
    get: getResourceGetMeta,
    delete: getResourceDeleteMeta,
  }

  return {
    ...helpers,
    getMeta,
  }
}
