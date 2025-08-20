const pauseDuration = 200;

export const getIdeas = async () => {
  await new Promise((resolve) => setTimeout(resolve, pauseDuration));
  return [
    {
      id: 1,
      title: "Idea 111",
      description: "Description 1",
    },
    {
      id: 2,
      title: "Idea 2",
      description: "Description 2",
    },
  ];
};

export const getIdea = async (id: number) => {
  await new Promise((resolve) => setTimeout(resolve, pauseDuration));
  const ideas = await getIdeas();
  const idea = ideas.find((idea) => idea.id === id);
  if (!idea) {
    throw new Error(`Idea ${id} not found`);
  }
  return idea;
};

export type Idea = Awaited<ReturnType<typeof getIdea>>;
