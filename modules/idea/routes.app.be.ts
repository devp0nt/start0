import { trpcBase } from '@trpc/backend'
import { Error0 } from '@devp0nt/error0'
import { zIdeaShowInput } from '@idea/admin/routes.app.sh'
import { zIdeaClientGuest } from './utils.sh'
import { parseZod } from '@shared/base/utils'

export const ideaListTrpcRoute = trpcBase().query(async ({ ctx }) => {
  const ideas = await ctx.prisma.idea.findMany()
  return { ideas: parseZod(zIdeaClientGuest, ideas) }
})

export const ideaShowTrpcRoute = trpcBase()
  .input(zIdeaShowInput)
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
