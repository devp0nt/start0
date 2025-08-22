export namespace IdeaBe {
  export const ideas = [
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
  ]

  export type Idea = (typeof ideas)[number]
}
