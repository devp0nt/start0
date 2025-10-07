import { trpcBase } from '@backend/core/trpc'
import { Error0 } from '@devp0nt/error0'
import { zGetIdeaInput } from '@idea/shared/routes.sh'
import { zIdeaClientGuest } from './utils.sh'
import { parseZod } from '@apps/shared/utils'

export const ideaListTrpcRoute = trpcBase().query(async ({ ctx }) => {
  const ideas = await ctx.prisma.idea.findMany()
  return { ideas: parseZod(zIdeaClientGuest, ideas) }
})

export const ideaShowTrpcRoute = trpcBase()
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
    return { idea: parseZod(zIdeaClientGuest, idea) }
  })
