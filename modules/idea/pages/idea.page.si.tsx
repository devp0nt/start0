import { Idea } from "@shmoject/modules/idea/utils.sh"
import { Page0 } from "@shmoject/site/lib/page0"
import { trpc } from "@shmoject/site/lib/trpc"
import { Route } from "@typed/route"

export const ideaPage = Page0.route(Idea.baseRoute.concat(Route.param("sn")))
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
