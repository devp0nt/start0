import { DataWidget } from '@admin/core/lib/field'
import { useResourceAbilities, useResourceSchema } from '@admin/core/lib/schema'
import { useResourceTitle } from '@admin/core/lib/shared'
import { extractTitleFromJsonSchema } from '@apps/shared/json'
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
  const schema = useResourceSchema()
  const { editable, showable, deleteable } = useResourceAbilities()
  const refineTable = useRefineTable({ syncWithLocation: true, ...input.useRefineTableProps })
  const title = useResourceTitle()
  if (!schema) {
    return <Alert type="error" message="No schema found" />
  }
  return (
    <List title={title}>
      <Table {...refineTable.tableProps} rowKey="id">
        {Object.entries(schema.properties || {}).map(([propKey, propValue]) => (
          <Table.Column
            dataIndex={propKey}
            title={extractTitleFromJsonSchema(propValue as any, propKey)}
            render={(value: any) => {
              return <DataWidget value={value} jsonSchema={propValue} />
            }}
          />
        ))}
        <Table.Column
          title={'Actions'}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              {editable && <EditButton hideText size="small" recordItemId={record.id} />}
              {showable && <ShowButton hideText size="small" recordItemId={record.id} />}
              {deleteable && <DeleteButton hideText size="small" recordItemId={record.id} />}
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
