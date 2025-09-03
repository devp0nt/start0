// @gen0:start await importExportedFromFiles("~/**/route.hono.ts", "HonoRoute")

import { pingHonoRoute } from "./ping/route.hono.js"
import { helloHonoRoute } from "./hello/route.hono.js"
// @gen0:end

import type { HonoApp } from "@ideanick/backend/lib/hono"

export namespace BackendHonoRouter {
  export const apply = ({ honoApp }: { honoApp: HonoApp.AppType }) => {
    // @gen0:start $.names.map(name => print(`${name}({ honoApp })`))
pingHonoRoute({ honoApp })
helloHonoRoute({ honoApp })
    // @gen0:end
  }
}
