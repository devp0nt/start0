// This is a test file for gen0

// @gen0:start print("// x"); print("// y")

// x
// y
// @gen0:end

// @gen0:start store.x = await importFromTsFiles({ globPattern: "~/**/route{s,}.*.ts", exportEndsWith: "TrpcRoute" })

import { pingTrpcRoute } from "../../apps/backend/src/router/ping/route.trpc.js"
import { getAppConfigTrpcRoute } from "../../modules/appConfig/routes.be.js"
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "../../modules/idea/routes.be.js"
// @gen0:end

// @gen0:start store.x.exportNames.map(name => print(`export const ${name}X = ${name}`))

export const getAppConfigTrpcRouteX = getAppConfigTrpcRoute
export const getIdeasTrpcRouteX = getIdeasTrpcRoute
export const getIdeaTrpcRouteX = getIdeaTrpcRoute
export const pingTrpcRouteX = pingTrpcRoute
// @gen0:end

export const message = "Hello from gen0"
