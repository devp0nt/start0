import { Page0 } from "@shmoject/site/lib/page0"
import { SiteRoutes } from "@shmoject/site/lib/routes"
import { trpc } from "@shmoject/site/lib/trpc"

export const ideaPage = Page0.route(SiteRoutes.ideaView)
  .loader(async ({ qc, params }) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaSn: params.sn }))
  })
  .title(({ params, loaderData: { idea } }) => `Idea: ${idea.title}`)
  .component(({ params, loaderData: { idea }, ctx }) => {
    return (
      <div>
        <h1>{idea.title}</h1>
        <p>{idea.description}</p>
        <pre>{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    )
  })
