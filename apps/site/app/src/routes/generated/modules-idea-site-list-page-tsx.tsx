/* eslint-disable */
import page from "../../../../../../modules/idea/site/list.page.js"
import { Error0 } from "@devp0nt/error0"
import { SiteError } from "@site/core/components/Error"
import { RR0 } from "@site/core/lib/rr0"
// import type { Route } from "./+types/modules-idea-site-list-page-tsx"

export const meta = (RR0.createMeta(({ loaderData, params, error }) => {
  if (!loaderData) {
    return [{ title: Error0.from(error).message }]
  }
  const result = page.meta({
    loaderData: loaderData.data,
    query: loaderData.query,
    params,
    ctx: loaderData.siteCtx,
  })
  return result
})) as any

export const loader = (RR0.createLoader(async ({ qc, params, query, ctx }) => {
  return await page.loader?.({ qc, params, query, ctx })
})) as any

export function ErrorBoundary({ error }: { error: any }) {
  return <SiteError.Page error={error} />
}

const RouteComponent = (RR0.createRouteComponent(
  ({ params, loaderData }) => {
    return (
      <page.component params={params} query={loaderData.query} loaderData={loaderData.data} ctx={loaderData.siteCtx} />
    )
  },
)) as any

export default RouteComponent
  