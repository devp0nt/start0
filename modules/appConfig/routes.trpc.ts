import { BackendTrpc } from "@shmoject/backend/lib/trpc"
import { zGetIdeaInput } from "@shmoject/modules/ideas/routes.model"
import { IdeaBe } from "@shmoject/modules/ideas/utils.be"
import { Error0 } from "@shmoject/modules/lib/error0"

export const getAppConfigTrpcRoute = BackendTrpc.baseProcedure().query(
  async ({ ctx }) => {
    return { appConfig: { rubInUsd: 87 } }
  },
)
