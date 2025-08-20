import z from "zod";

export namespace HelloRouteModel {
  export const zQuery = z.object({
    name: z.string().optional().default("world"),
  });

  export const zResponse = z.object({
    message: z.string(),
  });

  export const zModel = {
    query: zQuery,
    response: zResponse,
  };
}
