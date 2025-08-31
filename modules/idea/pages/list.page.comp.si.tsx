import type { Idea } from "@ideanick/modules/idea/utils.sh"
import { SiteCtx } from "@ideanick/site/lib/ctx"
import { siteRoutes } from "@ideanick/site/lib/routes"
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
            <Link to={siteRoutes.ideaView.get({ sn: idea.sn })}>{idea.title}</Link>
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
