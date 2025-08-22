import type { IdeaSh } from "@shmoject/modules/ideas/utils.sh"
import { Link } from "react-router"

export const IdeasPage = ({ ideas }: { ideas: IdeaSh.Client[] }) => {
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
