import { RJSFView } from '@admin/core/lib/rjsf'
import { useResourceSchema } from '@admin/core/lib/schema'
import { useResourceTitle } from '@admin/core/lib/shared'
import { Show } from '@refinedev/antd'
import { useShow, type UseShowProps } from '@refinedev/core'
import { Alert } from 'antd'

export const ResourceShowPage = (input: { useShowProps?: UseShowProps } = {}) => {
  const { result: record, query } = useShow({ ...input.useShowProps })
  const schema = useResourceSchema()
  const title = useResourceTitle()

  if (!schema) {
    return <Alert type="error" message="No schema found" />
  }

  return (
    <Show isLoading={query.isLoading} title={title}>
      <RJSFView schema={schema} data={record} />
    </Show>
  )
}
