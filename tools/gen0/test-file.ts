// This is a test file for gen0
// biome-ignore assist/source/organizeImports: we need to keep import order

// /gen0 print("// x"); print("// y")

// x
// y
// gen0/

// /gen0 store.x = await importFromTsFiles({ globPattern: "~/**/route{s,}.*.ts", exportEndsWith: "TrpcRoute" })

import { pingTrpcRoute } from "../../apps/backend/src/router/ping/route.trpc.js"
import { getAppConfigTrpcRoute } from "../../modules/appConfig/routes.be.js"
import { getIdeasTrpcRoute, getIdeaTrpcRoute } from "../../modules/idea/routes.be.js"
// gen0/

// /gen0 store.x.exportNames.map(name => print(`export const ${name}X = ${name}`))

export const getIdeasTrpcRouteX = getIdeasTrpcRoute
export const getIdeaTrpcRouteX = getIdeaTrpcRoute
export const getAppConfigTrpcRouteX = getAppConfigTrpcRoute
export const pingTrpcRouteX = pingTrpcRoute
// gen0/

export const message = "Hello from gen0"
