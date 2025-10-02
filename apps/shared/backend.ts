import { withJsonSchemaAsMeta } from '@apps/shared/json'
import z from 'zod'

export type ResourceAction = 'list' | 'create' | 'get' | 'update' | 'delete'
export type ResourceRoutePathAnyInput = {
  resource?: string
  prefix?: string
  suffix?: string
}
export type ResourceRoutePathWithMethodAnyInput = ResourceRoutePathAnyInput & {
  method: 'get' | 'post' | 'put' | 'delete'
  path?: string
}

export const zodToSelect = <TZodSchema extends z.ZodObject>(
  zSchema: TZodSchema,
): Record<keyof TZodSchema['shape'], true> => {
  return Object.fromEntries(Object.entries(zSchema.shape).map(([key, value]) => [key, true])) as never
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
  return data.map((d) => parseOneZod(zSchema, d))
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

export const getRoutesHelpers = ({
  prefix: defaultPrefix = '',
  resource: defaultResource,
}: {
  prefix?: string
  resource: string
}) => {
  const zError = z.object({
    error: z.object({ message: z.string() }),
    data: z.any().optional(),
  })

  const getResourceRoutePathAny = ({
    resource = defaultResource,
    prefix = defaultPrefix,
    suffix = '',
  }: ResourceRoutePathAnyInput) => {
    return `${prefix}/${resource}${suffix}`
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
  const path = {
    getResourceRoutePathAny,
    getResourceRoutePath,
    getResourceListRoutePath,
    getResourceCreateRoutePath,
    getResourceUpdateRoutePath,
    getResourceGetRoutePath,
    getResourceDeleteRoutePath,
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
  const pathWithMethod = {
    getResourceRoutePathWithMethodAny,
    getResourceRoutePathWithMethod,
    getResourceListRoutePathWithMethod,
    getResourceCreateRoutePathWithMethod,
    getResourceUpdateRoutePathWithMethod,
    getResourceGetRoutePathWithMethod,
    getResourceDeleteRoutePathWithMethod,
  }

  function getResSchema<TZResSchema extends z.ZodType>(description: string, schema: TZResSchema) {
    return {
      content: {
        'application/json': { schema },
      },
      description,
    }
  }

  function getResSchemaWithStatus<TStatus extends number, TZResSchema extends z.ZodType>(
    status: TStatus,
    description: string,
    schema: TZResSchema,
  ): {
    [status in TStatus]: {
      content: {
        'application/json': { schema: TZResSchema }
      }
      description: string
    }
  }
  function getResSchemaWithStatus<TStatus extends number, TZResSchema extends z.ZodType>(
    status: TStatus,
    schema: TZResSchema,
  ): {
    [status in TStatus]: {
      content: {
        'application/json': { schema: TZResSchema }
      }
      description: string
    }
  }
  function getResSchemaWithStatus<TZResSchema extends z.ZodType>(
    schema: TZResSchema,
  ): {
    200: {
      content: {
        'application/json': { schema: TZResSchema }
      }
      description: string
    }
  }
  function getResSchemaWithStatus(...args: [z.ZodType] | [number, z.ZodType] | [number, string, z.ZodType]) {
    const { status, description, schema } = (() => {
      if (typeof args[0] === 'number') {
        if (typeof args[1] === 'string') {
          return { status: args[0], description: args[1], schema: args[2] }
        } else {
          return { status: args[0], description: undefined, schema: args[1] }
        }
      } else {
        return { status: 200, description: undefined, schema: args[0] }
      }
    })()
    const descriptionNormalized =
      (description ?? Math.floor(status / 100) === 2) ? 'Success' : status === 404 ? 'Not Found' : 'Error'

    return {
      [status]: {
        content: {
          'application/json': { schema },
        },
        description: descriptionNormalized,
      },
    }
  }

  const getReqBodySchema = <TZBodySchema extends z.ZodType | undefined = undefined>(schema?: TZBodySchema) => {
    return (
      schema
        ? {
            content: {
              'application/json': { schema: withJsonSchemaAsMeta(schema) as TZBodySchema },
            },
            required: false,
          }
        : undefined
    ) as TZBodySchema extends z.ZodType ? { content: { 'application/json': { schema: TZBodySchema } } } : undefined
  }

  const getReqQuerySchema = <TZQuerySchema extends z.ZodType | undefined = undefined>(schema?: TZQuerySchema) => {
    return schema
      ? withJsonSchemaAsMeta(schema)
      : (undefined as TZQuerySchema extends z.ZodType ? TZQuerySchema : undefined)
  }

  const getReqParamsSchema = <TZParamsSchema extends z.ZodType | undefined = undefined>(schema?: TZParamsSchema) => {
    return schema
      ? withJsonSchemaAsMeta(schema)
      : (undefined as TZParamsSchema extends z.ZodType ? TZParamsSchema : undefined)
  }

  const schema = {
    getResSchemaWithStatus,
    getResSchema,
    getReqBodySchema,
    getReqQuerySchema,
    getReqParamsSchema,
  }

  function getResourceRouteSettings<
    TResponses extends { [key: string]: z.ZodType },
    TReqBodySchema extends z.ZodType | undefined = undefined,
    TReqQuerySchema extends z.ZodType | undefined = undefined,
    TReqParamsSchema extends z.ZodType | undefined = undefined,
  >(input: {
    resource?: string
    action: ResourceAction
    request?: {
      body?: TReqBodySchema
      query?: TReqQuerySchema
      params?: TReqParamsSchema
    }
    responses: TResponses
  }): {
    method: 'get' | 'post' | 'put' | 'delete'
    path: string
    request: {
      body: ReturnType<typeof getReqBodySchema<TReqBodySchema>>
      query: ReturnType<typeof getReqQuerySchema<TReqQuerySchema>>
      params: ReturnType<typeof getReqParamsSchema<TReqParamsSchema>>
    }
    responses: {
      [key in keyof TResponses]: ReturnType<typeof getResSchema<TResponses[key]>>
    }
  } {
    return {
      ...getResourceRoutePathWithMethod(input.action, input.resource),
      request: {
        body: getReqBodySchema(input.request?.body),
        query: getReqQuerySchema(input.request?.query),
        params: getReqParamsSchema(input.request?.params),
      },
      responses: {
        ...Object.fromEntries(
          Object.entries(input.responses).reduce((acc, [status, zSchema]) => {
            acc.push([status, getResSchema(status, zSchema)] as never)
            return acc
          }, []),
        ),
      } as never,
    }
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

  const getResourceListRouteSettings = <TFilters extends z.ZodType, TRes extends z.ZodType>(input: {
    resource?: string
    zFilters: TFilters
    zRes: TRes
  }) => {
    return getResourceRouteSettings({
      resource: input.resource,
      action: 'list',
      request: {
        body: z
          .object({
            filters: input.zFilters.optional(),
            pagination: zPaginationInput.optional().default(defaultPagination),
          })
          .optional()
          .default({ filters: undefined, pagination: defaultPagination }),
      },
      responses: {
        200: z.object({ data: z.array(input.zRes), total: z.number() }),
      },
    })
  }

  const getResourceGetRouteSettings = <TZRes extends z.ZodType>(input: { resource?: string; zRes: TZRes }) => {
    return getResourceRouteSettings({
      resource: input.resource,
      action: 'get',
      request: {
        query: z.object({
          id: z.uuid(),
        }),
      },
      responses: {
        200: z.object({ data: input.zRes }),
        404: zError,
      },
    })
  }

  const getResourceCreateRouteSettings = <TZReq extends z.ZodType, TZRes extends z.ZodType>(input: {
    resource?: string
    zReq: TZReq
    zRes: TZRes
  }) => {
    return getResourceRouteSettings({
      resource: input.resource,
      action: 'create',
      request: {
        body: z.object({ data: input.zReq }),
      },
      responses: {
        200: z.object({ data: input.zRes }),
      },
    })
  }

  const getResourceUpdateRouteSettings = <TZReq extends z.ZodType, TZRes extends z.ZodType>(input: {
    resource?: string
    zReq: TZReq
    zRes: TZRes
  }) => {
    return getResourceRouteSettings({
      resource: input.resource,
      action: 'update',
      request: {
        body: z.object({ id: z.uuid(), data: input.zReq }),
      },
      responses: {
        200: z.object({ data: input.zRes }),
        404: zError,
      },
    })
  }

  const getResourceDeleteRouteSettings = <TZRes extends z.ZodType>(input: { resource?: string; zRes: TZRes }) => {
    return getResourceRouteSettings({
      resource: input.resource,
      action: 'delete',
      request: {
        query: z.object({ id: z.uuid() }),
      },
      responses: {
        200: z.object({ data: input.zRes }),
        404: zError,
      },
    })
  }

  const settings = {
    getResourceListRouteSettings,
    getResourceGetRouteSettings,
    getResourceCreateRouteSettings,
    getResourceUpdateRouteSettings,
    getResourceDeleteRouteSettings,
  }

  return {
    zError,
    path,
    pathWithMethod,
    schema,
    pagination,
    settings,
  }
}
