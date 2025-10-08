import z from 'zod'
import { extractTitleFromJs, zFilters, zSorters, type ZodJsonSchema } from '../shared/utils'

let defaultZodToJsOptions: ZodToJsOptions = {
  datify: true,
  titlify: true,
  nullablify: true,
}

export const setDefaultZodToJsOptions = (options: ZodToJsOptions) => {
  defaultZodToJsOptions = options
}

export const getDefaultZodToJsOptions = (): ZodToJsOptions => {
  return defaultZodToJsOptions
}

export type ZodToJsOptions = {
  datify?: boolean
  titlify?: boolean
  nullablify?: boolean
} & Parameters<typeof z.toJSONSchema>[1]
export function zodToJs(zSchema: z.ZodType, options: ZodToJsOptions = {}): ZodJsonSchema {
  const { datify, titlify, ...restOptions } = {
    ...defaultZodToJsOptions,
    ...options,
  }
  return z.toJSONSchema(zSchema, {
    unrepresentable: 'any',
    ...restOptions,
    override: (ctx) => {
      // const def = (ctx.zodSchema as unknown as z.ZodType).def;
      const def = ctx.zodSchema._zod.def

      if (datify) {
        if (def.type === 'date') {
          ctx.jsonSchema.type = 'string'
          ctx.jsonSchema.format = 'date-time'
        }
      }

      if (ctx.jsonSchema.type === 'object' && titlify) {
        ctx.jsonSchema.properties = Object.fromEntries(
          Object.entries(ctx.jsonSchema.properties || {}).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return [key, value]
            }
            return [key, { ...value, title: value.title === '' ? '' : extractTitleFromJs(value, key) }]
          }),
        )
      }

      // let user-supplied override run too
      if (options.override) {
        options.override(ctx)
      }
    },
  })
}

export type ResourceAction = 'list' | 'create' | 'show' | 'edit' | 'delete'
export type ResourceRoutePathAnyInput = {
  resource?: string
  prefix?: string
  suffix?: string
}
export type ResourceMethod = 'get' | 'post' | 'put' | 'delete'
export type ResourceRoutePathWithMethodAnyInput = ResourceRoutePathAnyInput & {
  method: ResourceMethod
  path?: `/${string}`
}
export type ResourcePathWithMethod<TMethod extends ResourceMethod = ResourceMethod> = {
  method: TMethod
  path: `/${string}`
}

export const getRefineRoutesHelpers = ({
  prefix: defaultPrefix = '',
  resource: defaultResource,
  zodToJsOptions: defaultZodToJsOptions = {},
}: {
  prefix?: string
  resource: string
  zodToJsOptions?: ZodToJsOptions
}) => {
  const getResourceRoutePathAny = ({
    resource = defaultResource,
    prefix = defaultPrefix,
    suffix = '',
  }: ResourceRoutePathAnyInput): `/${string}` => {
    return `${prefix}/${resource}${suffix}` as `/${string}`
  }
  const getResourceListRoutePath = (resource?: string) => {
    return getResourceRoutePathAny({ resource, suffix: '/list' })
  }
  const getResourceCreateRoutePath = (resource?: string) => {
    return getResourceRoutePathAny({ resource, suffix: '/create' })
  }
  const getResourceEditRoutePath = (resource?: string) => {
    return getResourceRoutePathAny({ resource, suffix: '/edit' })
  }
  const getResourceShowRoutePath = (resource?: string) => {
    return getResourceRoutePathAny({ resource, suffix: '/show' })
  }
  const getResourceDeleteRoutePath = (resource?: string) => {
    return getResourceRoutePathAny({ resource, suffix: '/delete' })
  }
  const getResourceRoutePath = (action: ResourceAction, resource?: string) => {
    return {
      list: getResourceListRoutePath(resource),
      create: getResourceCreateRoutePath(resource),
      show: getResourceShowRoutePath(resource),
      edit: getResourceEditRoutePath(resource),
      delete: getResourceDeleteRoutePath(resource),
    }[action]
  }
  const getPath = {
    any: getResourceRoutePathAny,
    special: getResourceRoutePath,
    list: getResourceListRoutePath,
    create: getResourceCreateRoutePath,
    edit: getResourceEditRoutePath,
    show: getResourceShowRoutePath,
    delete: getResourceDeleteRoutePath,
  }

  const getResourceRoutePathWithMethodAny = ({
    resource,
    prefix,
    suffix,
    method,
    path,
  }: ResourceRoutePathWithMethodAnyInput) => {
    return {
      method,
      path: path ?? getResourceRoutePathAny({ resource, prefix, suffix }),
    }
  }
  const getResourceListRoutePathWithMethod = (resource?: string) => {
    return getResourceRoutePathWithMethodAny({ resource, method: 'post', path: getResourceListRoutePath(resource) })
  }
  const getResourceCreateRoutePathWithMethod = (resource?: string) => {
    return getResourceRoutePathWithMethodAny({ resource, method: 'post', path: getResourceCreateRoutePath(resource) })
  }
  const getResourceEditRoutePathWithMethod = (resource?: string) => {
    return getResourceRoutePathWithMethodAny({ resource, method: 'post', path: getResourceEditRoutePath(resource) })
  }
  const getResourceShowRoutePathWithMethod = (resource?: string) => {
    return getResourceRoutePathWithMethodAny({ resource, method: 'get', path: getResourceShowRoutePath(resource) })
  }
  const getResourceDeleteRoutePathWithMethod = (resource?: string) => {
    return getResourceRoutePathWithMethodAny({ resource, method: 'post', path: getResourceDeleteRoutePath(resource) })
  }
  const getResourceRoutePathWithMethod = (action: ResourceAction, resource?: string) => {
    return {
      list: getResourceListRoutePathWithMethod(resource),
      create: getResourceCreateRoutePathWithMethod(resource),
      show: getResourceShowRoutePathWithMethod(resource),
      edit: getResourceEditRoutePathWithMethod(resource),
      delete: getResourceDeleteRoutePathWithMethod(resource),
    }[action]
  }
  const getPathWithMethod = {
    any: getResourceRoutePathWithMethodAny,
    special: getResourceRoutePathWithMethod,
    list: getResourceListRoutePathWithMethod,
    create: getResourceCreateRoutePathWithMethod,
    edit: getResourceEditRoutePathWithMethod,
    show: getResourceShowRoutePathWithMethod,
    delete: getResourceDeleteRoutePathWithMethod,
  }

  const defaultPageSize = 10
  const defaultCurrentPage = 1
  const defaultPagination = { currentPage: defaultCurrentPage, pageSize: defaultPageSize }
  const zPagination = z.object({
    currentPage: z.coerce.number().default(defaultCurrentPage),
    pageSize: z.coerce.number().default(defaultPageSize),
  })
  const zPaginationInput = zPagination.optional().default(defaultPagination)
  const pagination = {
    zPagination,
    zPaginationInput,
    defaultPagination,
    defaultCurrentPage,
    defaultPageSize,
  }

  const withJsAsMeta = <TZodSchema extends z.ZodType>(
    zSchema: TZodSchema,
    options: ZodToJsOptions = {},
  ): TZodSchema => {
    return zSchema.meta(zodToJs(zSchema, { ...defaultZodToJsOptions, ...options }))
  }

  const zId = z.union([z.coerce.number(), z.string()])

  const getResourceListZInput = () => {
    return withJsAsMeta(
      z
        .object({
          filters: zFilters.optional().default([]),
          sorters: zSorters.optional().default([]),
          pagination: pagination.zPaginationInput.optional().default(pagination.defaultPagination),
        })
        .optional()
        .default({ filters: [], sorters: [], pagination: pagination.defaultPagination }),
    )
  }

  const getResourceShowZInput = () => {
    return withJsAsMeta(
      z.object({
        id: zId,
      }),
    )
  }

  const getResourceCreateZInput = <TZReqData extends z.ZodType>(zReqData: TZReqData) => {
    return z.object({
      data: withJsAsMeta(zReqData),
    })
  }

  const getResourceEditZInput = <TZReqData extends z.ZodType>(zReqData: TZReqData) => {
    return z.object({
      id: zId,
      data: withJsAsMeta(zReqData),
    })
  }

  const getResourceDeleteZInput = () => {
    return z.object({
      id: zId,
    })
  }

  const getZInput = {
    list: getResourceListZInput,
    show: getResourceShowZInput,
    create: getResourceCreateZInput,
    edit: getResourceEditZInput,
    delete: getResourceDeleteZInput,
  }

  const getResourceListZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return z.object({
      data: withJsAsMeta(z.array(zResData)),
      total: z.number(),
    })
  }

  const getResourceShowZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return z.object({
      data: withJsAsMeta(zResData),
    })
  }

  const getResourceCreateZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return z.object({
      data: withJsAsMeta(zResData),
    })
  }

  const getResourceEditZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return z.object({
      data: withJsAsMeta(zResData),
    })
  }

  const getResourceDeleteZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return z.object({
      data: withJsAsMeta(zResData),
    })
  }

  const getZOutput = {
    list: getResourceListZOutput,
    show: getResourceShowZOutput,
    create: getResourceCreateZOutput,
    edit: getResourceEditZOutput,
    delete: getResourceDeleteZOutput,
  }

  const parseListZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: Array<z.input<TZResData>>) => {
    return zResData.array().parse(data)
  }

  const parseShowZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: z.input<TZResData>) => {
    return zResData.parse(data)
  }

  const parseCreateZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: z.input<TZResData>) => {
    return zResData.parse(data)
  }

  const parseEditZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: z.input<TZResData>) => {
    return zResData.parse(data)
  }

  const parseDeleteZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: z.input<TZResData>) => {
    return zResData.parse(data)
  }

  const parseZOutput = {
    list: parseListZOutput,
    show: parseShowZOutput,
    create: parseCreateZOutput,
    edit: parseEditZOutput,
    delete: parseDeleteZOutput,
  }

  const zErrorResponse = z.object({
    error: z.object({ message: z.string() }),
    data: z.any().optional(),
  })
  const error = {
    zRespone: zErrorResponse,
  }

  return {
    error,
    pagination,
    getPath,
    getPathWithMethod,
    getZInput,
    getZOutput,
    parseZOutput,
    withJsAsMeta,
  }
}
