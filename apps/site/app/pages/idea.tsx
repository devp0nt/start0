import type { Idea } from "@shmoject/site/lib/ideas";

export const IdeaPage = ({ idea }: { idea: Idea }) => {
  return (
    <div>
      <h1>{idea.title}</h1>
      <p>{idea.description}</p>
    </div>
  );
};
