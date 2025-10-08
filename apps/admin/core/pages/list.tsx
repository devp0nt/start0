import { refine0 } from '@admin/app/lib/refine'
import { RjsfView } from '@admin/core/lib/rjsf.view'
import { extractTitleFromJs, getJsProperties, getJsValueByPath } from '@devp0nt/refine0/shared/utils'
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
        {Object.entries(getJsProperties(resource.js))
          .filter(([propKey, propJs]) => getJsValueByPath(propJs, 'x-hidden') !== true)
          .map(([propKey, propJs]) => (
            <Table.Column
              dataIndex={propKey}
              title={extractTitleFromJs(propJs, propKey)}
              render={(value: any) => {
                return (
                  <RjsfView
                    data={value}
                    js={propJs}
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
