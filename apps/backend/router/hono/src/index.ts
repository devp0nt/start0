// @gen0:start await importExportedFromFiles("~/**/route{s,}.ts", "HonoRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import { helloHonoRoute } from '@backend/hono-router/hello/route'
import { pingHonoRoute } from '@backend/hono-router/ping/route'
// @gen0:end

import type { HonoApp } from '@backend/core/lib/hono'

export namespace BackendHonoRouter {
  export const apply = ({ honoApp }: { honoApp: HonoApp.AppType }) => {
    // @gen0:start $.names.map(name => print(`${name}({ honoApp })`))
    helloHonoRoute({ honoApp })
    pingHonoRoute({ honoApp })
    // @gen0:end
  }
}
