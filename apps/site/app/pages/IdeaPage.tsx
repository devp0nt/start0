import type { IdeaSh } from "@shmoject/modules/ideas/utils.sh"

export const IdeaPage = ({ idea }: { idea: IdeaSh.Client }) => {
  return (
    <div>
      <h1>{idea.title}</h1>
      <p>{idea.description}</p>
    </div>
  )
}
