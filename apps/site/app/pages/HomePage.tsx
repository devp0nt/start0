import { Page0 } from "@shmoject/modules/lib/page0"
import { trpc, useTRPC } from "@shmoject/site/lib/trpc"
import { useQuery } from "@tanstack/react-query"
import { Route } from "@typed/route"

export const HomePage = Page0.route(Route.home)
  .loader(async ({ qc }) => {
    return await qc.fetchQuery(trpc.ping.queryOptions())
  })
  .title(() => `Home Page`)
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
