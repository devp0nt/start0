import type z from 'zod'
import { getRefineRoutesHelpers, type ResourceAction, type ResourceMethod, type ZodToJSOptions } from './utils'
import type { MiddlewareHandler } from 'hono'

// TODO: add default zIdSchema

export const getHonoRefineRoutesHelpers = <TDefaultMiddleware extends MiddlewareHandler[] | undefined = undefined>({
  prefix: defaultPrefix = '',
  resource: defaultResource,
  zodToJSOptions,
  defaultMiddleware,
}: {
  prefix?: string
  resource: string
  zodToJSOptions?: ZodToJSOptions
  defaultMiddleware?: TDefaultMiddleware
}) => {
  const helpers = getRefineRoutesHelpers({
    prefix: defaultPrefix,
    resource: defaultResource,
    zodToJSOptions,
  })
  const { getPathWithMethod, getZInput, getZOutput, error } = helpers

  type WithDefaultMiddleware<TMiddleware extends MiddlewareHandler[] | undefined = undefined> =
    TDefaultMiddleware extends undefined
      ? TMiddleware
      : TMiddleware extends undefined
        ? TDefaultMiddleware
        : TDefaultMiddleware extends MiddlewareHandler[]
          ? TMiddleware extends MiddlewareHandler[]
            ? [...TDefaultMiddleware, ...TMiddleware]
            : never
          : never
  const withDefaultMiddleware = <TMiddleware extends MiddlewareHandler[] | undefined = undefined>(
    middleware: TMiddleware,
  ): WithDefaultMiddleware<TMiddleware> => {
    if (!defaultMiddleware) {
      return middleware as WithDefaultMiddleware<TMiddleware>
    }
    if (!middleware) {
      return defaultMiddleware as WithDefaultMiddleware<TMiddleware>
    }
    return [...defaultMiddleware, ...middleware] as WithDefaultMiddleware<TMiddleware>
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
    TMiddleware extends MiddlewareHandler[] | undefined = undefined,
  >(input: {
    resource?: string
    action: ResourceAction
    middleware?: TMiddleware
    request?: {
      body?: TReqBodySchema
      query?: TReqQuerySchema
      params?: TReqParamsSchema
    }
    responses: TResponses
  }): {
    method: ResourceMethod
    path: string
    request: {
      body: ReturnType<typeof getReqBodySchema<TReqBodySchema>>
      query: ReturnType<typeof getReqQuerySchema<TReqQuerySchema>>
      params: ReturnType<typeof getReqParamsSchema<TReqParamsSchema>>
    }
    middleware: WithDefaultMiddleware<TMiddleware>
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
      middleware: withDefaultMiddleware(input.middleware) as WithDefaultMiddleware<TMiddleware>,
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

  const getResourceListRoute = <
    TZResData extends z.ZodType,
    TMiddleware extends MiddlewareHandler[] | undefined = undefined,
  >(input: {
    resource?: string
    middleware?: TMiddleware
    zResData: TZResData
  }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'list',
      middleware: input.middleware,
      request: {
        body: getZInput.list(),
      },
      responses: {
        200: getZOutput.list(input.zResData),
      },
    })
  }

  const getResourceShowRoute = <
    TZResData extends z.ZodType,
    TMiddleware extends MiddlewareHandler[] | undefined = undefined,
  >(input: {
    resource?: string
    middleware?: TMiddleware
    zResData: TZResData
  }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'show',
      middleware: input.middleware,
      request: {
        query: getZInput.show(),
      },
      responses: {
        200: getZOutput.show(input.zResData),
        404: error.zRespone,
      },
    })
  }

  const getResourceCreateRoute = <
    TZReqData extends z.ZodType,
    TZResData extends z.ZodType,
    TMiddleware extends MiddlewareHandler[] | undefined = undefined,
  >(input: {
    resource?: string
    middleware?: TMiddleware
    zReqData: TZReqData
    zResData: TZResData
  }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'create',
      middleware: input.middleware,
      request: {
        body: getZInput.create(input.zReqData),
      },
      responses: {
        200: getZOutput.create(input.zResData),
      },
    })
  }

  const getResourceEditRoute = <
    TZReqData extends z.ZodType,
    TZResData extends z.ZodType,
    TMiddleware extends MiddlewareHandler[] | undefined = undefined,
  >(input: {
    resource?: string
    middleware?: TMiddleware
    zReqData: TZReqData
    zResData: TZResData
  }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'edit',
      middleware: input.middleware,
      request: {
        body: getZInput.edit(input.zReqData),
      },
      responses: {
        200: getZOutput.edit(input.zResData),
        404: error.zRespone,
      },
    })
  }

  const getResourceDeleteRoute = <
    TZResData extends z.ZodType,
    TMiddleware extends MiddlewareHandler[] | undefined = undefined,
  >(input: {
    resource?: string
    middleware?: TMiddleware
    zResData: TZResData
  }) => {
    return getResourceRoute({
      resource: input.resource,
      action: 'delete',
      middleware: input.middleware,
      request: {
        query: getZInput.delete(),
      },
      responses: {
        200: getZOutput.delete(input.zResData),
        404: error.zRespone,
      },
    })
  }

  const getRoute = {
    list: getResourceListRoute,
    show: getResourceShowRoute,
    create: getResourceCreateRoute,
    edit: getResourceEditRoute,
    delete: getResourceDeleteRoute,
  }

  return {
    ...helpers,
    getSchema,
    getRoute,
  }
}
