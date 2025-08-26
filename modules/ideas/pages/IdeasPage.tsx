import { Idea } from "@shmoject/modules/ideas/utils"
import { Page0 } from "@shmoject/modules/lib/page0"
import { trpc } from "@shmoject/site/lib/trpc"
import { Link } from "react-router"

export const IdeasPage = Page0.route(Idea.baseRoute)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.getIdeas.queryOptions())
  })
  .title(`Ideas`)
  .component(({ loaderData: { ideas } }) => {
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
      </div>
    )
  })
