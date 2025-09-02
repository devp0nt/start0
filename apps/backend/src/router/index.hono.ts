// @gen0:start await importExportedFromFiles("~/**/route.hono.ts", "HonoRoute")

import { helloHonoRoute } from "./hello/route.hono.js"
import { pingHonoRoute } from "./ping/route.hono.js"
// @gen0:end

import type { HonoApp } from "@ideanick/backend/lib/hono"

export namespace BackendHonoRouter {
  export const apply = ({ honoApp }: { honoApp: HonoApp.AppType }) => {
    // @gen0:start $.names.map(name => print(`${name}({ honoApp })`))
    helloHonoRoute({ honoApp })
    pingHonoRoute({ honoApp })
    // @gen0:end
  }
}
