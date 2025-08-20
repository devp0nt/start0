// import { Hono0 } from "@shmoject/backend/lib/hono";

// export default Hono0.withApp(({ honoApp }) => {
//   honoApp.get("/ping", (c) => {
//     return c.text("pong");
//   });
// });

import { createRoute } from "@hono/zod-openapi";
import { HonoBackend } from "@shmoject/backend/lib/hono";
import z from "zod";

export default HonoBackend.withApp(({ honoApp }) => {
  honoApp.openapi(
    createRoute({
      method: "get",
      path: "/ping",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.any(),
            },
          },
          description: "Ping",
        },
      },
    }),
    (c) => {
      return c.json({
        message: "pong",
      });
    }
  );
});
