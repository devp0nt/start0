import { useRjsfUiSchema } from '@devp0nt/refine0/client'
import { extractTitleFromJS, getJSValueByPath, type JsonSchema } from '@devp0nt/refine0/shared/utils'
import { withTheme } from '@rjsf/core'
import type {
  ArrayFieldTemplateProps,
  FieldProps,
  FieldTemplateProps,
  GlobalUISchemaOptions,
  ObjectFieldTemplateProps,
  RegistryFieldsType,
  RegistryWidgetsType,
  TemplatesType,
  UiSchema,
} from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import MDEditor from '@uiw/react-md-editor'
import { Alert, Card, Descriptions, Empty, Image, List, Space, Tag, Typography } from 'antd'
import { formatDate } from 'date-fns/format'
import type { JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema'
import React from 'react'

const { Text, Paragraph, Link, Title } = Typography

/** ---------- Helpers ---------- */

const isEmpty = (val: unknown) =>
  val === undefined ||
  val === null ||
  (typeof val === 'string' && val.trim() === '') ||
  (Array.isArray(val) && val.length === 0) ||
  (typeof val === 'object' && Object.keys(val).length === 0)

/** ---------- Primitive renderers (no labels) ---------- */

const RenderString: React.FC<{ value: unknown; schema?: JSONSchema7Definition; uiSchema?: UiSchema }> = ({
  value,
  schema,
}) => {
  if (isEmpty(value)) return <Text type="secondary">—</Text>

  switch (typeof schema === 'object' ? schema.format : undefined) {
    case 'date':
      return <Text>{formatDate(String(value), 'yyyy-MM-dd')}</Text>
    case 'date-time':
      return <Text>{formatDate(String(value), 'yyyy-MM-dd HH:mm:ss')}</Text>
    case 'email':
      return <Link href={`mailto:${String(value)}`}>{String(value)}</Link>
    case 'url':
      return (
        <Link href={String(value)} target="_blank" rel="noreferrer">
          {String(value)}
        </Link>
      )
    case 'image':
      return <Image src={String(value)} alt="" />
    case 'file':
      return (
        <Link href={String(value)} target="_blank" rel="noreferrer">
          Download file
        </Link>
      )
    case 'markdown':
      return (
        <Card size="small">
          {/* @uiw/react-md-editor preview */}
          <MDEditor.Markdown source={String(value)} />
        </Card>
      )
    default:
      return <Paragraph style={{ marginBottom: 0 }}>{String(value)}</Paragraph>
  }
}

const RenderNumber: React.FC<{ value: unknown }> = ({ value }) =>
  isEmpty(value) ? <Text type="secondary">—</Text> : <Text>{String(value)}</Text>

const RenderBoolean: React.FC<{ value: unknown }> = ({ value }) =>
  typeof value === 'boolean' ? <Tag>{value ? 'True' : 'False'}</Tag> : <Text type="secondary">—</Text>

/** ---------- Fields (used by RJSF) ---------- */

const StringField: React.FC<FieldProps> = ({ formData, schema }) => <RenderString value={formData} schema={schema} />

const NumberField: React.FC<FieldProps> = ({ formData }) => <RenderNumber value={formData} />
const IntegerField: React.FC<FieldProps> = ({ formData }) => <RenderNumber value={formData} />
const BooleanField: React.FC<FieldProps> = ({ formData }) => <RenderBoolean value={formData} />
const NullField: React.FC<FieldProps> = () => <Text type="secondary">—</Text>

/** Resolve oneOf/anyOf to the first option that “matches” the data shape */
const pickComposedOption = (options: JSONSchema7Definition[] | undefined, data: unknown) => {
  if (!Array.isArray(options) || options.length === 0) return undefined
  const idx = options.findIndex((opt) => {
    if (typeof opt === 'object' && opt.properties && data && typeof data === 'object') {
      const keys = Object.keys(opt.properties)
      return keys.every((k) => k in data)
    }
    if (typeof opt === 'object' && opt.type && typeof data !== 'undefined') {
      if (Array.isArray(opt.type)) return opt.type.includes(typeof data as JSONSchema7TypeName)
      if (opt.type === 'array') return Array.isArray(data)
      if (opt.type === 'object') return typeof data === 'object' && !Array.isArray(data)
      // eslint-disable-next-line valid-typeof
      return typeof data === opt.type
    }
    return false
  })
  return options[idx >= 0 ? idx : 0]
}

const OneOfField: React.FC<FieldProps> = (props) => {
  const option = pickComposedOption(props.schema.oneOf, props.formData)
  if (!option || typeof option === 'boolean') return <Text type="secondary">—</Text>
  const SchemaField = props.registry.fields.SchemaField
  return <SchemaField {...props} schema={option} uiSchema={props.uiSchema} formData={props.formData} />
}

const AnyOfField: React.FC<FieldProps> = (props) => {
  const option = pickComposedOption(props.schema.anyOf, props.formData)
  if (!option || typeof option === 'boolean') return <Text type="secondary">—</Text>
  const SchemaField = props.registry.fields.SchemaField
  return <SchemaField {...props} schema={option} uiSchema={props.uiSchema} formData={props.formData} />
}

/** Arrays */
const ArrayField: React.FC<FieldProps> = (props) => {
  const { formData, schema, uiSchema, name } = props
  const itemsSchema = schema.items
  const label = extractTitleFromJS(schema, name)

  if (!Array.isArray(formData) || formData.length === 0) {
    return (
      <Card size="small" title={label}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items" />
      </Card>
    )
  }

  // Render as tags if it looks like a "tags" array
  const isTags =
    (typeof itemsSchema === 'object' &&
      !Array.isArray(itemsSchema) &&
      (itemsSchema.format === 'tags' || uiSchema?.['ui:widget'] === 'tags')) ||
    schema.format === 'tags'

  if (isTags && formData.every((x) => typeof x === 'string')) {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        {!label ? null : (
          <Title level={5} style={{ margin: 0 }}>
            {label}
          </Title>
        )}
        <Space wrap>
          {formData.map((v, i) => (
            <Tag key={i}>{v}</Tag>
          ))}
        </Space>
      </Space>
    )
  }

  // Generic list rendering; use SchemaField for each item so nested types are handled by our theme
  const SchemaField = props.registry.fields.SchemaField
  return (
    <Card size="small" title={label}>
      <List
        dataSource={formData}
        renderItem={(item, index) =>
          typeof itemsSchema === 'object' && (
            <List.Item key={index}>
              <SchemaField
                {...props}
                name={String(index)}
                schema={itemsSchema}
                formData={item}
                uiSchema={uiSchema?.items || uiSchema}
              />
            </List.Item>
          )
        }
      />
    </Card>
  )
}

/** Objects */
const ObjectField: React.FC<FieldProps> = (props) => {
  const { formData, schema, name } = props
  const properties = schema.properties || {}
  const label = extractTitleFromJS(schema, name)
  const asCard = getJSValueByPath(schema, 'x-card', false)
  const asDescriptions = getJSValueByPath(schema, 'x-descriptions', false)

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (asCard) {
      return (
        <Card size="small" title={label}>
          {children}
        </Card>
      )
    }
    return <>{children}</>
  }

  if (!formData || typeof formData !== 'object' || Object.keys(formData).length === 0) {
    return (
      <CardWrapper>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
      </CardWrapper>
    )
  }

  const SchemaField = props.registry.fields.SchemaField as React.FC<FieldProps>

  if (asDescriptions) {
    return (
      <CardWrapper>
        <Descriptions size="small" column={1} bordered>
          {Object.entries(properties).map(([key, childSchema]) => {
            const value = formData[key]
            if (typeof value === 'undefined') return null
            if (typeof childSchema === 'boolean') return null
            return (
              <Descriptions.Item
                key={key}
                label={extractTitleFromJS(childSchema, key)}
                styles={{ label: { width: 240 } }}
              >
                <SchemaField
                  {...props}
                  name={key}
                  schema={childSchema}
                  formData={value}
                  uiSchema={{
                    ...props.uiSchema?.[key],
                    'ui:options': { ...props.uiSchema?.[key]?.['ui:options'], label: false },
                  }}
                />
              </Descriptions.Item>
            )
          })}
        </Descriptions>
      </CardWrapper>
    )
  } else {
    return (
      <CardWrapper>
        <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
          {Object.entries(properties).map(([key, childSchema]) => {
            const value = formData[key]
            if (typeof childSchema === 'boolean') return null
            return (
              <SchemaField
                {...props}
                name={key}
                schema={childSchema}
                formData={value}
                uiSchema={props.uiSchema?.[key]}
              />
            )
          })}
        </Space>
      </CardWrapper>
    )
  }
}

/** Title/Description/Unsupported */
const TitleField: React.FC<FieldProps> = ({ schema, name }) => {
  const title = extractTitleFromJS(schema, name)
  return !title ? null : (
    <Title level={4} style={{ marginTop: 0 }}>
      {title}
    </Title>
  )
}

const DescriptionField: React.FC<FieldProps> = ({ description }) =>
  !description ? null : <Paragraph type="secondary">{String(description)}</Paragraph>

const UnsupportedField: React.FC<FieldProps> = ({ schema }) => (
  <Card size="small">
    <Text type="danger">Unsupported field schema: {schema.type || 'unknown'}</Text>
  </Card>
)

/** ---------- Templates ---------- */

const FieldTemplate = (props: FieldTemplateProps) => {
  const { id, label, description, errors, help, disabled, displayLabel, schema, children } = props

  // Objects and Arrays render their own labels/layout
  if (schema.type === 'object' || schema.type === 'array') {
    return <div id={id}>{children}</div>
  }

  return (
    <Space direction="vertical" style={{ width: '100%', gap: 4 }}>
      {displayLabel && (
        <Title level={5} style={{ margin: 0 }}>
          {label}
        </Title>
      )}
      {description}
      <div>{children}</div>
      {errors}
      {help}
      {disabled && null}
    </Space>
  )
}

const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => <div>{props.properties.map((p) => p.content)}</div>

const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => <div>{props.items.map((i) => i.children)}</div>

const templates = {
  ButtonTemplates: {
    SubmitButton: () => null,
    AddButton: () => null,
    CopyButton: () => null,
    MoveDownButton: () => null,
    MoveUpButton: () => null,
    RemoveButton: () => null,
  },
  FieldTemplate,
  ObjectFieldTemplate,
  ArrayFieldTemplate,
} satisfies Partial<TemplatesType>

/** ---------- Theme ---------- */

const widgets = {
  // In "view" we generally avoid interactive widgets; leave empty or add read-only display widgets if needed.
} satisfies RegistryWidgetsType

const fields = {
  StringField,
  NumberField,
  IntegerField,
  BooleanField,
  NullField,
  ObjectField,
  ArrayField,
  OneOfField,
  AnyOfField,
  TitleField,
  DescriptionField,
  UnsupportedField,
} satisfies RegistryFieldsType

const theme = {
  widgets,
  fields,
  templates,
}

const RjsfThemed = withTheme(theme)

/** ---------- Public component ---------- */

export const RjsfView = ({
  js,
  data,
  scope,
  uiSchemaGlobalOptions,
}: {
  js: JsonSchema | null
  data: unknown
  scope?: string | string[]
  uiSchemaGlobalOptions?: GlobalUISchemaOptions
}) => {
  if (!js || typeof js === 'boolean') {
    return <Alert type="error" message="No schema found" />
  }
  const uiSchema = useRjsfUiSchema({ js, scope, globalOptions: uiSchemaGlobalOptions })
  return (
    <RjsfThemed
      schema={js as any}
      validator={validator}
      tagName="div"
      formData={data}
      uiSchema={uiSchema}
      readonly
      liveValidate={false}
      noHtml5Validate
    />
  )
}
