import { IdeasPage } from "@ideanick/modules/idea/src/pages/list.page.comp.si"
import { GeneralLayout } from "apps/site/src/components/GeneralLayout"
import { Page0 } from "apps/site/src/lib/page0"
import { siteRoutes } from "apps/site/src/lib/routes"
import { trpc } from "apps/site/src/lib/trpc"

export default Page0.route(siteRoutes.ideasList)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  })
  .title(`Ideas`)
  .layout(GeneralLayout)
  .component(({ loaderData: { ideas } }) => {
    return <IdeasPage ideas={ideas} />
  })
