import { DataField } from '@admin/core/lib/field'
import { extractWidgetNameFromJsonSchema, type JsonSchema, type _JsonSchema } from '@apps/shared/json'
import { deepMap } from '@devp0nt/deepmap0'
import type { UseFormReturnType } from '@refinedev/antd'
import { Theme as AntDTheme } from '@rjsf/antd'
import { withTheme } from '@rjsf/core'
import type { UiSchema, WidgetProps } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import MDEditor from '@uiw/react-md-editor'
import { Alert, Flex } from 'antd'
import { get, pick, set } from 'lodash'

import { useEffect, useMemo, useState } from 'react'

const RJSFFormOriginal = withTheme(AntDTheme)
const NoSubmitButtonTemplates = {
  ButtonTemplates: {
    SubmitButton: () => null,
  },
}

const MdEditorWidget = (props: WidgetProps) => {
  return (
    <Flex justify="stretch" align="stretch" style={{ width: '100%' }}>
      <MDEditor
        data-color-mode="light"
        style={{ width: '100%' }}
        value={props.value || ''}
        onChange={(val) => {
          props.onChange(val)
        }}
      />
    </Flex>
  )
}

export const transformJsonsSchemaToUiSchema = (js: JsonSchema, type: 'form' | 'view' | 'preview'): UiSchema => {
  if (typeof js === 'boolean') {
    return transformJsonsSchemaToUiSchema({}, type)
  }
  const result: UiSchema = {}
  deepMap(js, ({ value, path }) => {
    if (typeof value === 'object' && value !== null) {
      const fixedPath = path.replaceAll('.properties.', '.').replaceAll('properties.', '')
      const xWidget = extractWidgetNameFromJsonSchema(value as _JsonSchema, type)
      if (xWidget) {
        set(result, fixedPath, { 'ui:widget': xWidget })
      }
      const xOptionsObject = get(value, ['x-options'])
      if (typeof xOptionsObject === 'object' && xOptionsObject !== null) {
        set(result, fixedPath, { 'ui:options': xOptionsObject })
      }
      for (const [propKey, propValue] of Object.entries(value)) {
        if (propKey.startsWith('x-options-')) {
          const optionKey = propKey.replace('x-options-', '')
          set(result, fixedPath, { 'ui:options': { ...result[fixedPath], [optionKey]: propValue } })
        }
      }
    }
    return value
  })
  return result
}

const useUiSchema = (schema: JsonSchema | null, type: 'form' | 'view' | 'preview') => {
  return useMemo(() => {
    return schema ? transformJsonsSchemaToUiSchema(schema, type) : undefined
  }, [schema])
}

const formWidgets = {
  markdown: MdEditorWidget,
}

export const RJSFForm = ({
  schema,
  refineForm,
  formRef,
  initialValues,
}: {
  schema: JsonSchema | null
  refineForm: UseFormReturnType
  formRef: React.RefObject<any>
  initialValues?: any
}) => {
  const uiSchema = useUiSchema(schema, 'form')
  const [formData, setFormData] = useState<any>()
  const [wasSubmitted, setWasSubmitted] = useState(false)
  useEffect(() => {
    if (wasSubmitted) {
      return
    }
    if (initialValues) {
      setFormData(pick(initialValues, Object.keys(schema?.properties || {})))
    } else {
      setFormData(pick(refineForm.formProps.initialValues, Object.keys(schema?.properties || {})))
    }
  }, [
    Object.keys(refineForm.formProps.initialValues || {}).length,
    Object.keys(initialValues || {}).length,
    schema,
    wasSubmitted,
  ])
  if (!schema) {
    return <Alert type="error" message="No schema found" />
  }
  return (
    <RJSFFormOriginal
      ref={formRef}
      schema={schema as any}
      validator={validator}
      templates={NoSubmitButtonTemplates}
      formData={formData}
      widgets={formWidgets}
      uiSchema={uiSchema}
      onChange={(e) => {
        setFormData(e.formData)
      }}
      onSubmit={(e) => {
        setWasSubmitted(true)
        void refineForm.onFinish(e.formData)
      }}
    />
  )
}

const viewFields = {
  ArrayField: DataField,
  ArraySchemaField: DataField,
  BooleanField: DataField,
  DescriptionField: DataField,
  OneOfField: DataField,
  AnyOfField: DataField,
  LayoutGridField: DataField,
  LayoutMultiSchemaField: DataField,
  LayoutHeaderField: DataField,
  NullField: DataField,
  NumberField: DataField,
  ObjectField: DataField,
  SchemaField: DataField,
  StringField: DataField,
  TitleField: DataField,
  UnsupportedField: DataField,
}

export const RJSFView = ({ schema, data }: { schema: JsonSchema | null; data: any }) => {
  const uiSchema = useUiSchema(schema, 'view')
  return (
    <RJSFFormOriginal
      schema={schema as any}
      validator={validator}
      tagName={'div'}
      templates={{
        ...NoSubmitButtonTemplates,
      }}
      formData={data}
      fields={viewFields}
      uiSchema={uiSchema}
      readonly={true}
    />
  )
}
