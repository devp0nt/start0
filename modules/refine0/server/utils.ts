import z from 'zod'
import { extractTitleFromJS, zFilters, zSorters, type ZodJsonSchema } from '../shared/utils'

let defaultZodToJSOptions: ZodToJSOptions = {
  titlify: true,
}

export const setDefaultZodToJSOptions = (options: ZodToJSOptions) => {
  defaultZodToJSOptions = options
}

export const getDefaultZodToJSOptions = (): ZodToJSOptions => {
  return defaultZodToJSOptions
}

export type ZodToJSOptions = {
  titlify?: boolean
} & Parameters<typeof z.toJSONSchema>[1]
export function zodToJS(zSchema: z.ZodType, options: ZodToJSOptions = {}): ZodJsonSchema {
  const { titlify, ...restOptions } = {
    ...defaultZodToJSOptions,
    ...options,
  }
  return z.toJSONSchema(zSchema, {
    unrepresentable: 'any',
    ...restOptions,
    override: (ctx) => {
      // const def = (ctx.zodSchema as unknown as z.ZodType).def;
      const def = ctx.zodSchema._zod.def

      // plain z.date()
      if (def.type === 'date') {
        ctx.jsonSchema.type = 'string'
        ctx.jsonSchema.format = 'date-time'
      }

      if (ctx.jsonSchema.type === 'object' && titlify) {
        ctx.jsonSchema.properties = Object.fromEntries(
          Object.entries(ctx.jsonSchema.properties || {}).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return [key, value]
            }
            return [key, { ...value, title: value.title === '' ? '' : extractTitleFromJS(value, key) }]
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
  zodToJSOptions: defaultZodToJSOptions = {},
}: {
  prefix?: string
  resource: string
  zodToJSOptions?: ZodToJSOptions
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

  const withJSAsMeta = <TZodSchema extends z.ZodType>(
    zSchema: TZodSchema,
    options: ZodToJSOptions = {},
  ): TZodSchema => {
    return zSchema.meta(zodToJS(zSchema, { ...defaultZodToJSOptions, ...options }))
  }

  const zId = z.union([z.coerce.number(), z.string()])

  const getResourceListZInput = () => {
    return withJSAsMeta(
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
    return withJSAsMeta(
      z.object({
        id: zId,
      }),
    )
  }

  const getResourceCreateZInput = <TZReqData extends z.ZodType>(zReqData: TZReqData) => {
    return z.object({
      data: withJSAsMeta(zReqData),
    })
  }

  const getResourceEditZInput = <TZReqData extends z.ZodType>(zReqData: TZReqData) => {
    return z.object({
      id: zId,
      data: withJSAsMeta(zReqData),
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
    return withJSAsMeta(
      z.object({
        data: z.array(zResData),
        total: z.number(),
      }),
    )
  }

  const getResourceShowZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJSAsMeta(
      z.object({
        data: zResData,
      }),
    )
  }

  const getResourceCreateZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJSAsMeta(
      z.object({
        data: zResData,
      }),
    )
  }

  const getResourceEditZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJSAsMeta(
      z.object({
        data: zResData,
      }),
    )
  }

  const getResourceDeleteZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJSAsMeta(
      z.object({
        data: zResData,
      }),
    )
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
    withJSAsMeta,
  }
}
