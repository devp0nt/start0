import { useQuery } from "@tanstack/react-query"
import { GeneralLayout } from "@/site/src/components/GeneralLayout"
import { Page0 } from "@/site/src/lib/page0"
import { siteRoutes } from "@/site/src/lib/routes"
import { trpc, useTRPC } from "@/site/src/lib/trpc"

export default Page0.route(siteRoutes.home)
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
