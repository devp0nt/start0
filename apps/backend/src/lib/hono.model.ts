import z from "zod";

export namespace HonoRouteModel {
  export type ResponseContentType =
    | "application/json"
    | "text/html"
    | "text/plain"
    | "application/xml";

  export type Model<
    TZQuery extends z.ZodObject | z.ZodAny | undefined = undefined,
    TZResponse extends z.ZodObject | z.ZodAny | undefined = undefined,
    TResponseContentType extends ResponseContentType | undefined = undefined,
  > = {
    query: TZQuery extends z.ZodObject ? TZQuery : undefined;
    response: TZResponse extends z.ZodObject ? TZResponse : z.ZodAny;
    responseContentType: TResponseContentType extends ResponseContentType
      ? TResponseContentType
      : "application/json";
  };

  export const defineModel = <
    TZQuery extends z.ZodObject | z.ZodAny | undefined = undefined,
    TZResponse extends z.ZodObject | z.ZodAny | undefined = undefined,
    TResponseContentType extends ResponseContentType | undefined = undefined,
  >(props: {
    query?: TZQuery;
    response?: TZResponse;
    responseContentType?: TResponseContentType;
  }) => {
    return {
      query: props.query,
      response: props.response || z.any(),
      responseContentType: props.responseContentType || "application/json",
    } as Model<TZQuery, TZResponse, TResponseContentType>;
  };
}
