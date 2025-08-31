import { BackendTrpc } from "@shmoject/backend/lib/trpc"
import { zGetIdeaInput } from "@shmoject/modules/idea/routes.input.sh"
import { Error0 } from "@shmoject/modules/lib/error0.sh"

export const getIdeasTrpcRoute = BackendTrpc.baseProcedure().query(async ({ ctx }) => {
  const ideas = await ctx.prisma.idea.findMany()
  return { ideas }
})

export const getIdeaTrpcRoute = BackendTrpc.baseProcedure()
  .input(zGetIdeaInput)
  .query(async ({ ctx, input }) => {
    const idea = await ctx.prisma.idea.findUnique({
      where: { sn: input.ideaSn },
    })
    if (!idea) {
      throw new Error0(`Idea ${input.ideaSn} not found`, {
        httpStatus: 404,
      })
    }
    return { idea }
  })
