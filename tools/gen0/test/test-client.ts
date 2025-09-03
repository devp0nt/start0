// This is a test file for gen0

// @gen0:start
// @gen0:end

// @gen0:start await importExportedFromFiles("~/**/route{s,}.*.ts", "TrpcRoute");

import { pingTrpcRoute } from "../../../apps/backend/src/router/ping/route.trpc.js"
import { getAppConfigTrpcRoute } from "../../../modules/appConfig/routes.be.js"
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "../../../modules/idea/routes.be.js"
// @gen0:end

// @gen0:start $.imports.map(im => print(`export const ${im.cutted} = ${im.name}`))
export const getAppConfig = getAppConfigTrpcRoute
export const getIdeas = getIdeasTrpcRoute
export const getIdea = getIdeaTrpcRoute
export const ping = pingTrpcRoute
// @gen0:end

export const message = "Hello from gen0"
