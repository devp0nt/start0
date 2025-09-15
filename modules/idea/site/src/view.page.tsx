import { GeneralLayout } from '@site/core/components/GeneralLayout'
import { Page0 } from '@site/core/lib/page0'
import { siteRoutes } from '@site/core/lib/routes'
import { trpc } from '@site/core/lib/trpc'

const page = Page0.route(siteRoutes.ideaView)
  .loader(async ({ qc, params }) => {
    return await qc.fetchQuery(trpc.getIdea.queryOptions({ ideaSn: params.sn }))
  })
  .title(({ params, loaderData: { idea } }) => `Idea: ${idea.title}`)
  .layout(GeneralLayout)
  .component(({ params, query, loaderData: { idea }, ctx }) => {
    return (
      <div>
        <h1>{idea.title}2ssssss2</h1>
        <p>{idea.description}</p>
        <pre>params:{JSON.stringify(params, null, 2)}</pre>
        <pre>query:{JSON.stringify(query, null, 2)}</pre>
        <pre>ctx:{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    )
  })

export default page
