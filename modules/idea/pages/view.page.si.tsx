import { Page0 } from "@ideanick/site/lib/page0"
import { siteRoutes } from "@ideanick/site/lib/routes"
import { trpc } from "@ideanick/site/lib/trpc"

export const ideaPage = Page0.route(siteRoutes.ideaView)
  .loader(async ({ qc, params }) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaSn: params.sn }))
  })
  .title(({ params, loaderData: { idea } }) => `Idea: ${idea.title}`)
  .component(({ params, query, loaderData: { idea }, ctx }) => {
    return (
      <div>
        <h1>{idea.title}22</h1>
        <p>{idea.description}</p>
        <pre>params:{JSON.stringify(params, null, 2)}</pre>
        <pre>query:{JSON.stringify(query, null, 2)}</pre>
        <pre>ctx:{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    )
  })
