// /gen0 store.x = await importFromTsFiles({ globPattern: "~/**/route.hono.ts", exportEndsWith: "HonoRoute" })

import { helloHonoRoute } from "./hello/route.hono.js"
import { pingHonoRoute } from "./ping/route.hono.js"
// gen0/

import type { HonoApp } from "@ideanick/backend/lib/hono"

export namespace BackendHonoRouter {
  export const apply = ({ honoApp }: { honoApp: HonoApp.AppType }) => {
    // /gen0 store.x.exportNames.map(name => print(`${name}({ honoApp })`))

    pingHonoRoute({ honoApp })
    helloHonoRoute({ honoApp })
    // gen0/
  }
}
