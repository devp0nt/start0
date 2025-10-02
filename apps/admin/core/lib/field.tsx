import { extractWidgetNameFromJsonSchema, type _JsonSchema, extractTitleFromJsonSchema } from '@apps/shared/json'
import {
  BooleanField,
  DateField,
  EmailField,
  FileField,
  ImageField,
  MarkdownField,
  NumberField,
  TagField,
  TextField,
  UrlField,
} from '@refinedev/antd'
import type { FieldProps } from '@rjsf/utils'
import { Card, Flex, Space, Typography } from 'antd'

const { Title } = Typography

const getWidgetName = ({
  name: providedName,
  jsonSchema,
  value,
}: {
  name?: unknown
  jsonSchema?: _JsonSchema
  value?: any
}): string => {
  if (typeof value === 'undefined' || value === null) {
    return 'text'
  }
  const retrievedName = providedName || extractWidgetNameFromJsonSchema(jsonSchema, 'view')
  const name = (() => {
    if (retrievedName || !jsonSchema || typeof jsonSchema === 'boolean') {
      return retrievedName
    }
    if (jsonSchema.format === 'date-time') {
      return 'dateTime'
    }
    if (jsonSchema.format === 'date') {
      return 'dateTime'
    }
    if (jsonSchema.format === 'email') {
      return 'email'
    }
    if (jsonSchema.format === 'file') {
      return 'file'
    }
    if (jsonSchema.format === 'image') {
      return 'image'
    }
    if (jsonSchema.format === 'number') {
      return 'number'
    }
    if (jsonSchema.format === 'tags') {
      return 'tags'
    }
    if (jsonSchema.format === 'text') {
      return 'text'
    }
    if (jsonSchema.format === 'url') {
      return 'url'
    }
    if (jsonSchema.format === 'markdown') {
      return 'markdown'
    }
    return 'text'
  })()
  return name as string
}

export const DataWidget: React.FC<{
  value: any
  name?: unknown
  jsonSchema?: _JsonSchema
}> = ({ value, name: providedName, jsonSchema }) => {
  const name = getWidgetName({ name: providedName, jsonSchema, value })
  switch (name) {
    case 'boolean':
      return <BooleanField value={value} />
    case 'date':
      return <DateField value={value} format="YYYY-MM-DD" />
    case 'dateTime':
      return <DateField value={value} format="YYYY-MM-DD HH:mm:ss" />
    case 'email':
      return <EmailField value={value} />
    case 'file':
      return <FileField src={value} />
    case 'image':
      return <ImageField value={value} />
    case 'markdown':
      return (
        <Card size="small">
          <MarkdownField value={value} />
        </Card>
      )
    case 'number':
      return <NumberField value={value} />
    case 'tags':
      return <TagField value={value} />
    case 'text':
      return <TextField value={value} />
    case 'url':
      return <UrlField value={value} />
    default:
      return <TextField value={value} />
  }
}

export const DataField = (props: FieldProps): React.ReactNode => {
  const { formData, schema, name } = props

  // arrays
  if (schema.type === 'array' && Array.isArray(formData)) {
    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {formData.map((item, idx) => (
          <Card key={idx} size="small">
            <DataField {...props} formData={item} schema={schema.items as any} name={String(idx)} />
          </Card>
        ))}
      </Space>
    )
  }

  // objects
  if (schema.type === 'object' && formData && typeof formData === 'object') {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {Object.entries(formData).map(([key, value]) => {
          const childSchema = schema.properties?.[key] as _JsonSchema | undefined
          if (!name) {
            return <DataField {...props} formData={value} schema={(childSchema || {}) as any} name={key} />
          } else {
            return (
              <Card key={key} size="small">
                <DataField {...props} formData={value} schema={(childSchema || {}) as any} name={key} />
              </Card>
            )
          }
        })}
      </Space>
    )
  }

  return (
    <Flex vertical key={name} style={{ width: '100%' }}>
      <Title level={5}>{extractTitleFromJsonSchema(schema as any, name)}</Title>
      <DataWidget value={formData} jsonSchema={schema as any} />
    </Flex>
  )
}
