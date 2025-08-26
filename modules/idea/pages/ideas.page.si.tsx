import { IdeasPage } from "@shmoject/modules/idea/pages/ideas.comp.si"
import { Idea } from "@shmoject/modules/idea/utils.sh"
import { Page0 } from "@shmoject/site/lib/page0"
import { trpc } from "@shmoject/site/lib/trpc"

export const ideasPage = Page0.route(Idea.baseRoute)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  })
  .title(`Ideas`)
  .component(({ loaderData: { ideas } }) => {
    return <IdeasPage ideas={ideas} />
  })
