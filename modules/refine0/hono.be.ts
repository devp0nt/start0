import type z from 'zod'
import { getRefineRoutesHelpers, type ResourceAction } from './utils.be'

export const getHonoRefineRoutesHelpers = ({
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
  const { getPathWithMethod, getZInput, getZOutput, error } = helpers

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
              'application/json': { schema: schema as TZBodySchema },
            },
            required: false,
          }
        : undefined
    ) as TZBodySchema extends z.ZodType ? { content: { 'application/json': { schema: TZBodySchema } } } : undefined
  }

  const getReqQuerySchema = <TZQuerySchema extends z.ZodType | undefined = undefined>(schema?: TZQuerySchema) => {
    return (schema || undefined) as TZQuerySchema extends z.ZodType ? TZQuerySchema : undefined
  }

  const getReqParamsSchema = <TZParamsSchema extends z.ZodType | undefined = undefined>(schema?: TZParamsSchema) => {
    return (schema || undefined) as TZParamsSchema extends z.ZodType ? TZParamsSchema : undefined
  }

  const getSchema = {
    resWithStatus: getResSchemaWithStatus,
    res: getResSchema,
    reqBody: getReqBodySchema,
    reqQuery: getReqQuerySchema,
    reqParams: getReqParamsSchema,
  }

  function getResourceRoute<
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
      ...getPathWithMethod.special(input.action, input.resource),
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

  const getResourceListRoute = <TZFilters extends z.ZodType, TZResData extends z.ZodType>(input: {
    resource?: string
    zFilters: TZFilters
    zResData: TZResData
  }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'list',
      request: {
        body: getZInput.list(input.zFilters),
      },
      responses: {
        200: getZOutput.list(input.zResData),
      },
    })
  }

  const getResourceGetRoute = <TZResData extends z.ZodType>(input: { resource?: string; zResData: TZResData }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'get',
      request: {
        query: getReqParamsSchema(input.zResData),
      },
      responses: {
        200: getZOutput.get(input.zResData),
        404: error.zRespone,
      },
    })
  }

  const getResourceCreateRoute = <TZReqData extends z.ZodType, TZResData extends z.ZodType>(input: {
    resource?: string
    zReqData: TZReqData
    zResData: TZResData
  }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'create',
      request: {
        body: getZInput.create(input.zReqData),
      },
      responses: {
        200: getZOutput.create(input.zResData),
      },
    })
  }

  const getResourceUpdateRoute = <TZReqData extends z.ZodType, TZResData extends z.ZodType>(input: {
    resource?: string
    zReqData: TZReqData
    zResData: TZResData
  }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'update',
      request: {
        body: getZInput.update(input.zReqData),
      },
      responses: {
        200: getZOutput.update(input.zResData),
        404: error.zRespone,
      },
    })
  }

  const getResourceDeleteRoute = <TZResData extends z.ZodType>(input: { resource?: string; zResData: TZResData }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'delete',
      request: {
        query: getReqParamsSchema(input.zResData),
      },
      responses: {
        200: getZOutput.delete(input.zResData),
        404: error.zRespone,
      },
    })
  }

  const getRoute = {
    list: getResourceListRoute,
    get: getResourceGetRoute,
    create: getResourceCreateRoute,
    update: getResourceUpdateRoute,
    delete: getResourceDeleteRoute,
  }

  return {
    ...helpers,
    getSchema,
    getRoute,
  }
}
