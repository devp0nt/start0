import { IdeasPage } from "@ideanick/modules/idea/pages/list.page.comp.si"
import { Page0 } from "@ideanick/site/lib/page0"
import { siteRoutes } from "@ideanick/site/lib/routes"
import { trpc } from "@ideanick/site/lib/trpc"

export const ideasPage = Page0.route(siteRoutes.ideasList)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  })
  .title(`Ideas`)
  .component(({ loaderData: { ideas } }) => {
    return <IdeasPage ideas={ideas} />
  })
