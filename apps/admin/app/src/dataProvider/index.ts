import qs from 'qs'
import type { AxiosInstance } from 'axios'
import type { DataProvider } from '@refinedev/core'
import { generateFilter } from './generateFilter'
import { generatePagination } from './generatePagination'
import { axiosInstance } from '@admin/core/lib/axios'

export const backendDataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance,
): Omit<Required<DataProvider>, 'createMany' | 'updateMany' | 'deleteMany'> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${apiUrl}/${resource}/list`
    const { headers: headersFromMeta } = meta ?? {}
    const requestMethod = 'post'
    const generatedPagination = pagination?.mode === 'server' ? generatePagination(pagination) : {}
    const generatedFilters = generateFilter(filters)
    const querySort = {} // TODO: Implement sort
    const { data } = await httpClient[requestMethod](
      url,
      {
        data: {
          pagination: generatedPagination,
          filters: generatedFilters,
          sort: querySort,
        },
      },
      {
        headers: headersFromMeta,
      },
    )
    return {
      data: data.data,
      total: data.total,
    }
  },

  getMany: async ({ resource, ids, meta }) => {
    const url = `${apiUrl}/${resource}/list`
    const { headers } = meta ?? {}
    const requestMethod = 'post'
    const { data } = await httpClient[requestMethod](
      url,
      {
        pagination: { take: ids.length, skip: 0 },
        filters: { id: { in: ids } },
      },
      {
        headers,
      },
    )
    return {
      data: data.data,
    }
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}/create`
    const { headers } = meta ?? {}
    const requestMethod = 'post'
    const { data } = await httpClient[requestMethod](
      url,
      { data: variables },
      {
        headers,
      },
    )
    return {
      data: data.data,
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/update`
    const { headers } = meta ?? {}
    const requestMethod = 'post'
    const { data } = await httpClient[requestMethod](
      url,
      {
        id,
        data: variables,
      },
      {
        headers,
      },
    )
    return {
      data: data.data,
    }
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/${resource}/get`
    const { headers } = meta ?? {}
    const requestMethod = 'get'
    const { data } = await httpClient[requestMethod](url, {
      headers,
      params: { id },
    })
    return {
      data: data.data,
    }
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/delete`
    const { headers } = meta ?? {}
    const requestMethod = 'post'
    const { data } = await httpClient[requestMethod](url, {
      headers,
      params: { id },
      data: { variables },
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
      // TODO: Implement sort
      // const generatedSort = generateSort(sorters)
      // if (generatedSort) {
      //   const { _sort, _order } = generatedSort
      //   const sortQuery = {
      //     _sort: _sort.join(','),
      //     _order: _order.join(','),
      //   }
      //   requestUrl = `${requestUrl}&${stringify(sortQuery)}`
      // }
    }

    if (filters) {
      const filterQuery = generateFilter(filters)
      requestUrl = `${requestUrl}&${qs.stringify(filterQuery)}`
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
})
