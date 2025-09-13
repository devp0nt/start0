// @gen0:start await importExportedFromFiles("~/**/route.hono.ts", "HonoRoute")

import { helloHonoRoute } from "./hello/route.js"
import { pingHonoRoute } from "./ping/route.js"
// @gen0:end

import type { HonoApp } from "@/backend/lib/hono"

export namespace BackendHonoRouter {
  export const apply = ({ honoApp }: { honoApp: HonoApp.AppType }) => {
    // @gen0:start $.names.map(name => print(`${name}({ honoApp })`))
    pingHonoRoute({ honoApp })
    helloHonoRoute({ honoApp })
    // @gen0:end
  }
}
