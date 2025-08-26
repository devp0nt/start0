import { IdeasPage } from "@shmoject/modules/ideas/pages/ideas.page.component"
import { Idea } from "@shmoject/modules/ideas/utils"
import { Page0 } from "@shmoject/modules/lib/page0"
import { trpc } from "@shmoject/site/lib/trpc"

export const ideasPage = Page0.route(Idea.baseRoute)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  })
  .title(`Ideas`)
  .component(({ loaderData: { ideas } }) => {
    return <IdeasPage ideas={ideas} />
  })
