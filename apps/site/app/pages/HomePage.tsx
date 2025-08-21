import { useTRPC } from "@shmoject/site/lib/trpc"
import { useQuery } from "@tanstack/react-query"

export const HomePage = ({
  dataFromLoader = {},
}: {
  dataFromLoader?: Record<string, any>
}) => {
  const trpc = useTRPC()
  const { data: dataFromClient } = useQuery(trpc.ping.queryOptions())
  return (
    <div>
      <h1>Home Page</h1>
      <p>Hello! Check our ideas!</p>
      <pre>{JSON.stringify({ dataFromLoader, dataFromClient }, null, 2)}</pre>
    </div>
  )
}
