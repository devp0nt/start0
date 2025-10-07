import type { Refine0ResourceAction, RefineAction } from '@devp0nt/refine0/client/utils'
import type { DataProvider, MetaQuery } from '@refinedev/core'
import type { AxiosInstance } from 'axios'
import pick from 'lodash/pick.js'
import qs from 'qs'

export const refine0DataProvider = ({
  apiUrl,
  httpClient,
  getResourceAction,
}: {
  apiUrl: string
  httpClient: AxiosInstance
  getResourceAction: (props: { resource: string; action: RefineAction }) => Refine0ResourceAction | null
}): Omit<Required<DataProvider>, 'createMany' | 'updateMany' | 'deleteMany'> => {
  const getData = async ({
    resource,
    action,
    input,
    params,
    body,
    meta,
    httpClient,
    apiUrl,
  }: {
    resource: string
    action: RefineAction
    input?: Record<string, unknown>
    params?: Record<string, unknown>
    body?: Record<string, unknown>
    meta?: MetaQuery
    httpClient: AxiosInstance
    apiUrl: string
  }) => {
    const refine0Resource = getResourceAction({ resource, action })
    if (!refine0Resource) {
      throw new Error(`Action "${action}" for resource "${resource}" not found`)
    }
    const url = `${apiUrl}${refine0Resource.path}`
    const { headers: headersFromMeta } = meta ?? {}
    const { data } = await (async () => {
      if (refine0Resource.method === 'get' || refine0Resource.method === 'delete') {
        const urlWithParams = [url, qs.stringify({ ...input, ...params })].filter(Boolean).join('?')
        return await httpClient[refine0Resource.method](urlWithParams, {
          headers: headersFromMeta,
        })
      } else {
        const urlWithParams = [url, qs.stringify({ ...input, ...params })].filter(Boolean).join('?')
        return await httpClient[refine0Resource.method](
          urlWithParams,
          {
            ...(input || body
              ? {
                  ...input,
                  ...body,
                }
              : {}),
          },
          {
            headers: headersFromMeta,
          },
        )
      }
    })()
    return data
  }

  return {
    getList: async ({ resource, pagination, filters, sorters, meta }) => {
      const input = {
        pagination: pagination ? pick(pagination, ['currentPage', 'pageSize']) : undefined,
        filters,
        sorters,
      }
      const data = await getData({
        resource,
        action: 'list',
        input,
        meta,
        httpClient,
        apiUrl,
      })
      return {
        data: data.data,
        total: data.total,
      }
    },

    getMany: async ({ resource, ids, meta }) => {
      const data = await getData({
        resource,
        action: 'list',
        input: { filters: { ids } },
        meta,
        httpClient,
        apiUrl,
      })
      return {
        data: data.data,
      }
    },

    create: async ({ resource, variables, meta }) => {
      const data = await getData({
        resource,
        action: 'create',
        input: { data: variables },
        meta,
        httpClient,
        apiUrl,
      })
      return {
        data: data.data,
      }
    },

    update: async ({ resource, id, variables, meta }) => {
      const data = await getData({
        resource,
        action: 'edit',
        input: { id, data: variables },
        meta,
        httpClient,
        apiUrl,
      })
      return {
        data: data.data,
      }
    },

    getOne: async ({ resource, id, meta }) => {
      const data = await getData({
        resource,
        action: 'show',
        input: { id },
        meta,
        httpClient,
        apiUrl,
      })
      return {
        data: data.data,
      }
    },

    deleteOne: async ({ resource, id, variables, meta }) => {
      const data = await getData({
        resource,
        action: 'delete',
        input: { id, data: variables },
        meta,
        httpClient,
        apiUrl,
      })
      return {
        data: data.data,
      }
    },

    getApiUrl: () => {
      return apiUrl
    },

    custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
      let requestUrl = `${apiUrl}/${url}`

      if (sorters) {
        requestUrl = `${requestUrl}&${qs.stringify(sorters)}`
      }

      if (filters) {
        requestUrl = `${requestUrl}&${qs.stringify(filters)}`
      }

      if (query) {
        requestUrl = `${requestUrl}&${qs.stringify(query)}`
      }

      let axiosResponse
      switch (method) {
        case 'put':
        case 'post':
        case 'patch':
          axiosResponse = await httpClient[method](
            url,
            { ...payload },
            {
              headers,
            },
          )
          break
        case 'delete':
          axiosResponse = await httpClient.delete(url, {
            data: { ...payload },
            headers,
          })
          break
        default:
          axiosResponse = await httpClient.get(requestUrl, {
            headers,
            params: query,
          })
          break
      }

      const { data } = axiosResponse

      return await Promise.resolve({ data })
    },
  }
}
