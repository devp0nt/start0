import { toErrorResponse, toErrorResponseWithStatus, zErrorResponse } from '@backend/core/error'
import z from 'zod'
import { extractTitleFromJsonSchema, type JsonSchema } from './utils.sh'

export function zodToJsonSchema(schema: z.ZodType, options: Parameters<typeof z.toJSONSchema>[1] = {}): JsonSchema {
  return z.toJSONSchema(schema, {
    unrepresentable: 'any',
    ...options,
    override: (ctx) => {
      // const def = (ctx.zodSchema as unknown as z.ZodType).def;
      const def = ctx.zodSchema._zod.def

      // plain z.date()
      if (def.type === 'date') {
        ctx.jsonSchema.type = 'string'
        ctx.jsonSchema.format = 'date-time'
      }

      if (ctx.jsonSchema.type === 'object') {
        ctx.jsonSchema.properties = Object.fromEntries(
          Object.entries(ctx.jsonSchema.properties || {}).map(([key, value]) => {
            if (typeof value === 'boolean') {
              return [key, value]
            }
            return [key, { ...value, title: extractTitleFromJsonSchema(value, key) }]
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

export function withJsonSchemaAsMeta<TZodSchema extends z.ZodType>(schema: TZodSchema): TZodSchema {
  return schema.meta(zodToJsonSchema(schema))
}

export type ResourceAction = 'list' | 'create' | 'get' | 'update' | 'delete'
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

export const parseOneZod = <TZodSchema extends z.ZodObject>(
  zSchema: TZodSchema,
  data: z.input<TZodSchema>,
): z.infer<TZodSchema> => {
  return zSchema.parse(data)
}
export const parseManyZod = <TZodSchema extends z.ZodObject>(
  zSchema: TZodSchema,
  data: Array<z.input<TZodSchema>>,
): Array<z.infer<TZodSchema>> => {
  return z.array(zSchema).parse(data)
}
export function parseZod<TZodSchema extends z.ZodObject>(
  zSchema: TZodSchema,
  data: z.input<TZodSchema>,
): z.infer<TZodSchema>
export function parseZod<TZodSchema extends z.ZodObject>(
  zSchema: TZodSchema,
  data: Array<z.input<TZodSchema>>,
): Array<z.infer<TZodSchema>>
export function parseZod<TZodSchema extends z.ZodObject>(
  zSchema: TZodSchema,
  data: z.input<TZodSchema> | Array<z.input<TZodSchema>>,
): z.infer<TZodSchema> | Array<z.infer<TZodSchema>> {
  return Array.isArray(data) ? parseManyZod(zSchema, data) : parseOneZod(zSchema, data)
}

export const getRefineRoutesHelpers = ({
  prefix: defaultPrefix = '',
  resource: defaultResource,
}: {
  prefix?: string
  resource: string
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
  const getResourceUpdateRoutePath = (resource?: string) => {
    return getResourceRoutePathAny({ resource, suffix: '/update' })
  }
  const getResourceGetRoutePath = (resource?: string) => {
    return getResourceRoutePathAny({ resource, suffix: '/get' })
  }
  const getResourceDeleteRoutePath = (resource?: string) => {
    return getResourceRoutePathAny({ resource, suffix: '/delete' })
  }
  const getResourceRoutePath = (action: ResourceAction, resource?: string) => {
    return {
      list: getResourceListRoutePath(resource),
      create: getResourceCreateRoutePath(resource),
      get: getResourceGetRoutePath(resource),
      update: getResourceUpdateRoutePath(resource),
      delete: getResourceDeleteRoutePath(resource),
    }[action]
  }
  const getPath = {
    any: getResourceRoutePathAny,
    special: getResourceRoutePath,
    list: getResourceListRoutePath,
    create: getResourceCreateRoutePath,
    update: getResourceUpdateRoutePath,
    get: getResourceGetRoutePath,
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
  const getResourceUpdateRoutePathWithMethod = (resource?: string) => {
    return getResourceRoutePathWithMethodAny({ resource, method: 'post', path: getResourceUpdateRoutePath(resource) })
  }
  const getResourceGetRoutePathWithMethod = (resource?: string) => {
    return getResourceRoutePathWithMethodAny({ resource, method: 'get', path: getResourceGetRoutePath(resource) })
  }
  const getResourceDeleteRoutePathWithMethod = (resource?: string) => {
    return getResourceRoutePathWithMethodAny({ resource, method: 'post', path: getResourceDeleteRoutePath(resource) })
  }
  const getResourceRoutePathWithMethod = (action: ResourceAction, resource?: string) => {
    return {
      list: getResourceListRoutePathWithMethod(resource),
      create: getResourceCreateRoutePathWithMethod(resource),
      get: getResourceGetRoutePathWithMethod(resource),
      update: getResourceUpdateRoutePathWithMethod(resource),
      delete: getResourceDeleteRoutePathWithMethod(resource),
    }[action]
  }
  const getPathWithMethod = {
    any: getResourceRoutePathWithMethodAny,
    special: getResourceRoutePathWithMethod,
    list: getResourceListRoutePathWithMethod,
    create: getResourceCreateRoutePathWithMethod,
    update: getResourceUpdateRoutePathWithMethod,
    get: getResourceGetRoutePathWithMethod,
    delete: getResourceDeleteRoutePathWithMethod,
  }

  const defaultTake = 10
  const defaultSkip = 0
  const defaultPagination = { take: defaultTake, skip: defaultSkip }
  const zPagination = z.object({
    take: z.coerce.number().default(defaultTake),
    skip: z.coerce.number().default(defaultSkip),
  })
  const zPaginationInput = zPagination.optional().default(defaultPagination)
  const pagination = {
    zPagination,
    zPaginationInput,
    defaultPagination,
    defaultTake,
    defaultSkip,
  }

  const getResourceListZInput = <TZFilters extends z.ZodType>(zFilters: TZFilters) => {
    return withJsonSchemaAsMeta(
      z
        .object({
          filters: zFilters.optional(),
          pagination: pagination.zPaginationInput.optional().default(pagination.defaultPagination),
        })
        .optional()
        .default({ filters: undefined, pagination: pagination.defaultPagination }),
    )
  }

  const getResourceGetZInput = () => {
    return withJsonSchemaAsMeta(
      z.object({
        id: z.uuid(),
      }),
    )
  }

  const getResourceCreateZInput = <TZReqData extends z.ZodType>(zReqData: TZReqData) => {
    return withJsonSchemaAsMeta(
      z.object({
        data: zReqData,
      }),
    )
  }

  const getResourceUpdateZInput = <TZReqData extends z.ZodType>(zReqData: TZReqData) => {
    return withJsonSchemaAsMeta(
      z.object({
        id: z.uuid(),
        data: zReqData,
      }),
    )
  }

  const getResourceDeleteZInput = () => {
    return withJsonSchemaAsMeta(
      z.object({
        id: z.uuid(),
      }),
    )
  }

  const getZInput = {
    list: getResourceListZInput,
    get: getResourceGetZInput,
    create: getResourceCreateZInput,
    update: getResourceUpdateZInput,
    delete: getResourceDeleteZInput,
  }

  const getResourceListZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJsonSchemaAsMeta(
      z.object({
        data: z.array(zResData),
        total: z.number(),
      }),
    )
  }

  const getResourceGetZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJsonSchemaAsMeta(
      z.object({
        data: zResData,
      }),
    )
  }

  const getResourceCreateZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJsonSchemaAsMeta(
      z.object({
        data: zResData,
      }),
    )
  }

  const getResourceUpdateZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJsonSchemaAsMeta(
      z.object({
        data: zResData,
      }),
    )
  }

  const getResourceDeleteZOutput = <TZResData extends z.ZodType>(zResData: TZResData) => {
    return withJsonSchemaAsMeta(
      z.object({
        data: zResData,
      }),
    )
  }

  const getZOutput = {
    list: getResourceListZOutput,
    get: getResourceGetZOutput,
    create: getResourceCreateZOutput,
    update: getResourceUpdateZOutput,
    delete: getResourceDeleteZOutput,
  }

  const parseListZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: Array<z.input<TZResData>>) => {
    return zResData.array().parse(data)
  }

  const parseGetZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: z.input<TZResData>) => {
    return zResData.parse(data)
  }

  const parseCreateZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: z.input<TZResData>) => {
    return zResData.parse(data)
  }

  const parseUpdateZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: z.input<TZResData>) => {
    return zResData.parse(data)
  }

  const parseDeleteZOutput = <TZResData extends z.ZodType>(zResData: TZResData, data: z.input<TZResData>) => {
    return zResData.parse(data)
  }

  const parseZOutput = {
    list: parseListZOutput,
    get: parseGetZOutput,
    create: parseCreateZOutput,
    update: parseUpdateZOutput,
    delete: parseDeleteZOutput,
  }

  const error = {
    zRespone: zErrorResponse,
    toResponseWithStatus: toErrorResponseWithStatus,
    toResponse: toErrorResponse,
  }

  return {
    error,
    pagination,
    getPath,
    getPathWithMethod,
    getZInput,
    getZOutput,
    parseZOutput,
  }
}
