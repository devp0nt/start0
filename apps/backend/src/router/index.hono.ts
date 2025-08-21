// @index('./**/route.hono.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}HonoRoute } from '${f.path}.js'`)
import { helloHonoRoute } from "./hello/route.hono.js";
import { pingHonoRoute } from "./ping/route.hono.js";
// @endindex

import { HonoApp } from "@shmoject/backend/lib/hono";

export namespace BackendHonoRouter {
  export const applyToHonoApp = HonoApp.withApp(({ honoApp }) => {
    // @index('./**/route.hono.ts', f => `${f.path.split('/').slice(0, -1).pop()}HonoRoute.apply({ honoApp })`)
    helloHonoRoute.apply({ honoApp });
    pingHonoRoute.apply({ honoApp });
    // @endindex
  });
}
