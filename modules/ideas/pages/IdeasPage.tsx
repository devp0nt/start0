import { Idea } from "@shmoject/modules/ideas/utils"
import { Page0 } from "@shmoject/modules/lib/page0"
import { SiteCtx } from "@shmoject/site/lib/ctx"
import { trpc } from "@shmoject/site/lib/trpc"
import { Link } from "react-router"

export const IdeasPage = Page0.route(Idea.baseRoute)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  })
  .title(`Ideas`)
  .component(({ loaderData: { ideas } }) => {
    const ctx = SiteCtx.useCtx()
    return (
      <div>
        <h1>Ideas</h1>
        <ul>
          {ideas.map((idea) => (
            <li key={idea.id}>
              <Link to={`/ideas/${idea.id}`}>{idea.title}</Link>
            </li>
          ))}
          <li>
            <Link to={`/ideas/234234`}>Non-existing idea</Link>
          </li>
        </ul>
        <pre>{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    )
  })
