import { BackendTrpc } from "@shmoject/backend/lib/trpc"
import { IdeasRoutesModel } from "@shmoject/modules/ideas/routes.model"
import { IdeaBe } from "@shmoject/modules/ideas/utils.be"
import { Error0 } from "@shmoject/modules/lib/error0"

export const getIdeasTrpcRoute = BackendTrpc.baseProcedure().query(
  async ({ ctx }) => {
    ctx.logger.info("Getting ideas", {
      other: {
        password: "123456",
      },
    })

    return { ideas: IdeaBe.ideas }
  },
)

export const getIdeaTrpcRoute = BackendTrpc.baseProcedure()
  .input(IdeasRoutesModel.zGetIdeaInput)
  .query(async ({ ctx, input }) => {
    const idea = IdeaBe.ideas.find((idea) => idea.id === input.ideaId)
    if (!idea) {
      throw new Error0(`Idea ${input.ideaId} not found`, {
        code: "IDEA_NOT_FOUND",
        httpStatus: 404,
      })
    }
    return { idea }
  })
