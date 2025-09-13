import { IdeasPage } from "@/idea/pages/list.page.comp.si"
import { GeneralLayout } from "@/site/components/GeneralLayout"
import { Page0 } from "@/site/lib/page0"
import { siteRoutes } from "@/site/lib/routes"
import { trpc } from "@/site/lib/trpc"

export default Page0.route(siteRoutes.ideasList)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  })
  .title(`Ideas`)
  .layout(GeneralLayout)
  .component(({ loaderData: { ideas } }) => {
    return <IdeasPage ideas={ideas} />
  })
