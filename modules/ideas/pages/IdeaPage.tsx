import { Idea } from "@shmoject/modules/ideas/utils"
import { Page0 } from "@shmoject/modules/lib/page0"
import { trpc } from "@shmoject/site/lib/trpc"
import { Route } from "@typed/route"

export const IdeaPage = Page0.create()
  .route(Idea.baseRoute.concat(Route.param("id")))
  .loader(async ({ qc, params }) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaId: params.id }))
  })
  .title(({ params, loaderData: { idea } }) => `Idea: ${idea.title}`)
  .component(({ params, loaderData: { idea } }) => {
    return (
      <div>
        <h1>{idea.title}</h1>
        <p>{idea.description}</p>
      </div>
    )
  })
