// @gen0:start await importExportedFromFiles("~/**/route{s,}.ts", "HonoRoute")

import { pingHonoRoute } from "./ping/route.js"
import { helloHonoRoute } from "./hello/route.js"
// @gen0:end

import type { HonoApp } from "@backend/core/lib/hono"

export namespace BackendHonoRouter {
  export const apply = ({ honoApp }: { honoApp: HonoApp.AppType }) => {
    // @gen0:start $.names.map(name => print(`${name}({ honoApp })`))
pingHonoRoute({ honoApp })
helloHonoRoute({ honoApp })
    // @gen0:end
  }
}
