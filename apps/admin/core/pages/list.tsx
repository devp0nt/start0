import { refine0 } from '@admin/app/lib/refine'
import { RjsfView } from '@admin/core/lib/rjsf.view'
import { extractTitleFromJS, getJSProperties, getJSValueByPath } from '@devp0nt/refine0/shared/utils'
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable as useRefineTable,
  type useTableProps,
} from '@refinedev/antd'
import type { BaseRecord } from '@refinedev/core'
import { Alert, Space, Table } from 'antd'

type UseTableByMetaProps = {
  useRefineTableProps?: useTableProps<any, any, any, any>
}

export type ResourceTableProps = UseTableByMetaProps & {
  toolbarRender?: React.ReactNode
}
export const ResourceTable = (input: ResourceTableProps) => {
  const resource = refine0.useResourceWithAction()
  const refineTable = useRefineTable({ syncWithLocation: true, ...input.useRefineTableProps })
  if (!resource) {
    return <Alert type="error" message="No schema found" />
  }
  return (
    <List>
      <Table {...refineTable.tableProps} rowKey="id">
        {Object.entries(getJSProperties(resource.js))
          .filter(([propKey, propJS]) => getJSValueByPath(propJS, 'x-invisible') !== true)
          .map(([propKey, propJS]) => (
            <Table.Column
              dataIndex={propKey}
              title={extractTitleFromJS(propJS, propKey)}
              render={(value: any) => {
                return (
                  <RjsfView
                    data={value}
                    js={propJS}
                    scope={['view', 'preview']}
                    uiSchemaGlobalOptions={{ label: false }}
                  />
                )
              }}
            />
          ))}
        <Table.Column
          title={'Actions'}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              {resource.edit && <EditButton hideText size="small" recordItemId={record.id} />}
              {resource.show && <ShowButton hideText size="small" recordItemId={record.id} />}
              {resource.delete && <DeleteButton hideText size="small" recordItemId={record.id} />}
            </Space>
          )}
        />
      </Table>
    </List>
  )
}

export const ResourceListPage = (input: ResourceTableProps) => {
  return <ResourceTable {...input} />
}
