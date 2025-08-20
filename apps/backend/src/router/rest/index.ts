// @index('./**/route.hono.ts', f => `import ${f.path.split('/').slice(0, -1).pop()}HonoRoute from '${f.path}.js'`)
import helloHonoRoute from "./hello/route.hono.js";
import pingHonoRoute from "./ping/route.hono.js";
// @endindex

import { Hono0 } from "@shmoject/backend/lib/hono";

export const applyHonoRoutes = Hono0.withApp(({ honoApp }) => {
  // @index('./**/route.hono.ts', f => `${f.path.split('/').slice(0, -1).pop()}HonoRoute({ honoApp })`)
  helloHonoRoute({ honoApp });
  pingHonoRoute({ honoApp });
  // @endindex
});
