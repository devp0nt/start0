import { IdeasPage } from "@shmoject/modules/idea/pages/list.page.comp.si"
import { Page0 } from "@shmoject/site/lib/page0"
import { SiteRoutes } from "@shmoject/site/lib/routes"
import { trpc } from "@shmoject/site/lib/trpc"

export const ideasPage = Page0.route(SiteRoutes.ideasList)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  })
  .title(`Ideas`)
  .component(({ loaderData: { ideas } }) => {
    return <IdeasPage ideas={ideas} />
  })
