import { Page0 } from "@shmoject/site/lib/page0"
import { siteRoutes } from "@shmoject/site/lib/routes"
import { trpc } from "@shmoject/site/lib/trpc"

// export const ideaPage = Page0.route(siteRoutes.ideaView)
//   .loader(async ({ qc, params }) => {
//     return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaSn: params.sn }))
//   })
//   .title(({ params, loaderData: { idea } }) => `Idea: ${idea.title}`)
//   .component(({ params, query, loaderData: { idea }, ctx }) => {
//     return (
//       <div>
//         <h1>{idea.title}</h1>
//         <p>{idea.description}</p>
//         <pre>params:{JSON.stringify(params, null, 2)}</pre>
//         <pre>query:{JSON.stringify(query, null, 2)}</pre>
//         <pre>ctx:{JSON.stringify(ctx, null, 2)}</pre>
//       </div>
//     )
//   })

export const ideaPage = Page0.create({
  route: siteRoutes.ideaView,
  loader: async ({ qc, params }) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaSn: params.sn }))
  },
  title: ({ params, loaderData: { idea } }) => `Idea: ${idea.title}`,
  component: ({ params, query, loaderData: { idea }, ctx }) => {
    return (
      <div>
        <h1>{idea.title}</h1>
        <p>{idea.description}</p>
        <pre>params:{JSON.stringify(params, null, 2)}</pre>
        <pre>query:{JSON.stringify(query, null, 2)}</pre>
        <pre>ctx:{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    )
  },
})
