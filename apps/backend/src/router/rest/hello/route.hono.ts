import { createRoute } from "@hono/zod-openapi";
import { Hono0 } from "@shmoject/backend/lib/hono";
import { HelloRouteModel } from "./model";

export default Hono0.withApp(({ honoApp }) => {
  honoApp.openapi(
    createRoute({
      method: "get",
      path: "/hello",
      request: {
        query: HelloRouteModel.zQuery,
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: HelloRouteModel.zResponse,
            },
          },
          description: "Say hello",
        },
      },
    }),
    (c) => {
      const query = c.req.valid("query");
      return c.json({
        message: `Hello, ${query.name}`,
      });
    }
  );
});
