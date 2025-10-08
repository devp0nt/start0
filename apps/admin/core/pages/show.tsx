import { refine0 } from '@admin/app/lib/refine'
import { RjsfView } from '@admin/core/lib/rjsf.view'
import { Show } from '@refinedev/antd'
import { useShow, type UseShowProps } from '@refinedev/core'
import { Alert, Skeleton } from 'antd'

export const ResourceShowPage = (input: { useShowProps?: UseShowProps } = {}) => {
  const { result: data, query } = useShow({ ...input.useShowProps })
  const resource = refine0.useResourceWithAction()

  if (!resource) {
    return <Alert type="error" message="No schema found" />
  }

  return (
    <Show isLoading={query.isLoading}>
      {query.isLoading ? <Skeleton active /> : <RjsfView js={resource.js} data={data} scope="view" />}
    </Show>
  )
}
