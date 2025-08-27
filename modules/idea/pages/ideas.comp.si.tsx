import { ideaPage } from "@shmoject/modules/idea/pages/idea.page.si"
import type { Idea } from "@shmoject/modules/idea/utils.sh"
import { SiteCtx } from "@shmoject/site/lib/ctx"
import { Link } from "react-router"

export const IdeasPage: React.FC<{
  ideas: Idea.Client[]
}> = ({ ideas }) => {
  const ctx = SiteCtx.useCtx()
  return (
    <div>
      <h1>Ideas</h1>
      <ul>
        {ideas.map((idea) => (
          <li key={idea.id}>
            <Link to={ideaPage.route.interpolate({ sn: idea.sn.toString() })}>
              {idea.title}
            </Link>
          </li>
        ))}
        <li>
          <Link to={`/ideas/234234`}>Non-existing idea</Link>
        </li>
      </ul>
      <pre>{JSON.stringify(ctx, null, 2)}</pre>
    </div>
  )
}
