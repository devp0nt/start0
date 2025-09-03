import { GeneralLayout } from "apps/site/src/components/GeneralLayout"
import { Page0 } from "apps/site/src/lib/page0"
import { siteRoutes } from "apps/site/src/lib/routes"
import { trpc } from "apps/site/src/lib/trpc"

export default Page0.route(siteRoutes.ideaView)
  .loader(async ({ qc, params }) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaSn: params.sn }))
  })
  .title(({ params, loaderData: { idea } }) => `Idea: ${idea.title}`)
  .layout(GeneralLayout)
  .component(({ params, query, loaderData: { idea }, ctx }) => {
    return (
      <div>
        <h1>{idea.title}2ssssss2</h1>
        <p>{idea.description}</p>
        <pre>params:{JSON.stringify(params, null, 2)}</pre>
        <pre>query:{JSON.stringify(query, null, 2)}</pre>
        <pre>ctx:{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    )
  })
