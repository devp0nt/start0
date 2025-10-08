import { useEvalRjsfJs, useRjsfUiSchema } from '@devp0nt/refine0/client'
import { useRemoveAdditionalDataByJs } from '@devp0nt/refine0/client/utils'
import type { JsonSchema } from '@devp0nt/refine0/shared/utils'
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
import { customizeValidator } from '@rjsf/validator-ajv8'
import Ajv2020 from '@rjsf/validator-ajv8/node_modules/ajv/dist/2020'
import MDEditor from '@uiw/react-md-editor'
import { Alert, Flex } from 'antd'
import { useEffect, useState } from 'react'

const validator = customizeValidator({
  AjvClass: Ajv2020,
  ajvOptionsOverrides: {
    strict: false,
  },
})

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
  templates: {
    ...AntDTheme.templates,
    ...templates,
    ButtonTemplates: { ...AntDTheme.templates?.ButtonTemplates, ...templates.ButtonTemplates },
  },
}

const RjsfThemed = withTheme(theme)

export const RjsfForm = ({
  js,
  refineForm,
  formRef,
  initialValues,
  uiSchemaGlobalOptions,
}: {
  js: JsonSchema | null
  refineForm: UseFormReturnType
  formRef: React.RefObject<any>
  initialValues?: any
  uiSchemaGlobalOptions?: GlobalUISchemaOptions
}) => {
  const [formData, setFormData] = useState<any>()
  const fixedJs = useEvalRjsfJs(js, formData)
  const uiSchema = useRjsfUiSchema({ js: fixedJs, scope: 'form', globalOptions: uiSchemaGlobalOptions })
  const [wasSubmitted, setWasSubmitted] = useState(false)
  const fixedInitialValues = useRemoveAdditionalDataByJs(fixedJs, initialValues || refineForm.formProps.initialValues)
  useEffect(() => {
    if (wasSubmitted) {
      return
    }
    setFormData(fixedInitialValues)
  }, [JSON.stringify(fixedInitialValues), JSON.stringify(initialValues), wasSubmitted])
  if (!fixedJs) {
    return <Alert type="error" message="No schema found" />
  }
  return (
    <RjsfThemed
      ref={formRef}
      schema={fixedJs}
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
