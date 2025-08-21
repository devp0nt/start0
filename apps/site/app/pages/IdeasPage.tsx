import type { Idea } from "@shmoject/site/lib/ideas"
import { Link } from "react-router"

export const IdeasPage = ({ ideas }: { ideas: Idea[] }) => {
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
}
