import { GeneralLayout } from "@site/core/components/GeneralLayout"
import { Page0 } from "@site/core/lib/page0"
import { siteRoutes } from "@site/core/lib/routes"
import { trpc, useTRPC } from "@site/core/lib/trpc"
import { useQuery } from "@tanstack/react-query"

const page = Page0.route(siteRoutes.home)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.ping.queryOptions())
  })
  .title(() => `Home Page`)
  .layout(GeneralLayout)
  .component(({ loaderData: dataFromLoader }) => {
    const trpc = useTRPC()
    const { data: dataFromClient } = useQuery(trpc.ping.queryOptions())
    return (
      <div>
        <h1>Home Page</h1>
        <p>Hello! Check our ideas!</p>
        <pre>{JSON.stringify({ dataFromLoader, dataFromClient }, null, 2)}</pre>
      </div>
    )
  })

export default page
