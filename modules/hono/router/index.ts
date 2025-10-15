import { honoBase } from '@backend/core/hono'

// @gen0:start $.app = await importExportedFromFiles("~/**/route{s,}{.*,}{.be,}.ts", "AppHonoRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import { helloAppHonoRoute } from '@hono/router/hello/route'
import { pingAppHonoRoute, bigPingAppHonoRoute } from '@hono/router/ping/route'
// @gen0:end

// @gen0:start $.admin = await importExportedFromFiles("~/**/route{s,}{.*,}{.be,}.ts", "AdminHonoRoute", (file0) => mono0.getFilePathRelativeToPackageName(file0.path.abs))

import {
  adminUserListAdminHonoRoute,
  adminUserShowAdminHonoRoute,
  adminUserCreateAdminHonoRoute,
  adminUserEditAdminHonoRoute,
  adminUserDeleteAdminHonoRoute,
} from '@adminUser/backend/routes.admin.be'
import {
  ideaListAdminHonoRoute,
  ideaShowAdminHonoRoute,
  ideaCreateAdminHonoRoute,
  ideaEditAdminHonoRoute,
  ideaDeleteAdminHonoRoute,
} from '@idea/backend/routes.admin.be'
// @gen0:end

export const honoApp = honoBase()
  // @gen0:start $.app.imports.map(im => print(`  .route('/', ${im.name})`))
  .route('/', helloAppHonoRoute)
  .route('/', pingAppHonoRoute)
  .route('/', bigPingAppHonoRoute)
// @gen0:end

export const honoAdmin = honoBase()
  // @gen0:start $.admin.imports.map(im => print(`  .route('/', ${im.name})`))
  .route('/', adminUserListAdminHonoRoute)
  .route('/', adminUserShowAdminHonoRoute)
  .route('/', adminUserCreateAdminHonoRoute)
  .route('/', adminUserEditAdminHonoRoute)
  .route('/', adminUserDeleteAdminHonoRoute)
  .route('/', ideaListAdminHonoRoute)
  .route('/', ideaShowAdminHonoRoute)
  .route('/', ideaCreateAdminHonoRoute)
  .route('/', ideaEditAdminHonoRoute)
  .route('/', ideaDeleteAdminHonoRoute)
// @gen0:end

export type HonoApp = typeof honoApp
export type HonoAdmin = typeof honoAdmin
