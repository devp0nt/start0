import { useRjsfUiSchema } from '@devp0nt/refine0/client'
import { getJsonSchemaProperties, type JsonSchema } from '@devp0nt/refine0/shared/utils'
import type { UseFormReturnType } from '@refinedev/antd'
import { Theme as AntDTheme } from '@rjsf/antd'
import { withTheme } from '@rjsf/core'
import type {
  GlobalUISchemaOptions,
  RegistryFieldsType,
  RegistryWidgetsType,
  TemplatesType,
  WidgetProps,
} from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import MDEditor from '@uiw/react-md-editor'
import { Alert, Flex } from 'antd'
import { pick } from 'lodash'
import { useEffect, useState } from 'react'

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

const widgets = {
  markdown: MdEditorWidget,
} satisfies RegistryWidgetsType

const templates = {
  ButtonTemplates: {
    SubmitButton: () => null,
  },
} satisfies Omit<Partial<TemplatesType>, 'ButtonTemplates'> & {
  ButtonTemplates: Partial<TemplatesType['ButtonTemplates']>
}

const fields = {} satisfies RegistryFieldsType

const theme = {
  ...AntDTheme,
  widgets: { ...AntDTheme.widgets, ...widgets },
  fields: { ...AntDTheme.fields, ...fields },
  templates: { ...AntDTheme.templates, ...templates },
}

const RjsfThemed = withTheme(theme)

export const RjsfForm = ({
  schema,
  refineForm,
  formRef,
  initialValues,
  uiSchemaGlobalOptions,
}: {
  schema: JsonSchema | null
  refineForm: UseFormReturnType
  formRef: React.RefObject<any>
  initialValues?: any
  uiSchemaGlobalOptions?: GlobalUISchemaOptions
}) => {
  const uiSchema = useRjsfUiSchema({ schema, scope: 'form', globalOptions: uiSchemaGlobalOptions })
  const [formData, setFormData] = useState<any>()
  const [wasSubmitted, setWasSubmitted] = useState(false)
  // TODO: do initial values omit better
  useEffect(() => {
    if (wasSubmitted) {
      return
    }
    const properties = getJsonSchemaProperties(schema)
    if (initialValues) {
      setFormData(pick(initialValues, Object.keys(properties)))
    } else {
      setFormData(pick(refineForm.formProps.initialValues, Object.keys(properties)))
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
    <RjsfThemed
      ref={formRef}
      schema={schema as any}
      validator={validator}
      formData={formData}
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
