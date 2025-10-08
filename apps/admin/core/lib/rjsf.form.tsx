import { useRjsfUiSchema } from '@devp0nt/refine0/client'
import { useRjsfData, useRjsfJs } from '@devp0nt/refine0/client/utils'
import { getJsValueByPath, type JsonSchema } from '@devp0nt/refine0/shared/utils'
import type { UseFormReturnType } from '@refinedev/antd'
import { Theme as AntDTheme } from '@rjsf/antd'
import { withTheme } from '@rjsf/core'
import type {
  FieldTemplateProps,
  FormContextType,
  GenericObjectType,
  GlobalUISchemaOptions,
  RegistryFieldsType,
  RegistryWidgetsType,
  RJSFSchema,
  StrictRJSFSchema,
  TemplatesType,
  WidgetProps,
} from '@rjsf/utils'
import { getTemplate, getUiOptions } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import Ajv2020 from '@rjsf/validator-ajv8/node_modules/ajv/dist/2020'
import MDEditor from '@uiw/react-md-editor'
import { Alert, Card, Checkbox, Flex, Form, Typography, type CheckboxChangeEvent } from 'antd'
import cloneDeep from 'lodash/cloneDeep.js'
import get from 'lodash/get.js'
import set from 'lodash/set.js'
import unset from 'lodash/unset.js'
import { useCallback, useEffect, useMemo, useState } from 'react'

const { Text } = Typography

// https://github.com/rjsf-team/react-jsonschema-form/blob/4616bb6d3cffc4c7597675d0f9f696921e2cb11c/packages/antd/src/templates/FieldTemplate/index.tsx
const VERTICAL_LABEL_COL = { span: 24 }
const VERTICAL_WRAPPER_COL = { span: 24 }
/** The `FieldTemplate` component is the template used by `SchemaField` to render any field. It renders the field
 * content, (label, description, children, errors and help) inside of a `WrapIfAdditional` component.
 *
 * @param props - The `FieldTemplateProps` for this component
 */
export default function FieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: FieldTemplateProps<T, S, F>) {
  const {
    children,
    classNames,
    style,
    description,
    disabled,
    displayLabel,
    errors,
    help,
    hidden,
    id,
    label,
    onDropPropertyClick,
    onKeyChange,
    rawErrors,
    rawDescription,
    rawHelp,
    readonly,
    registry,
    required,
    schema,
    uiSchema,
  } = props
  const { formContext } = registry
  const {
    colon,
    labelCol = VERTICAL_LABEL_COL,
    wrapperCol = VERTICAL_WRAPPER_COL,
    wrapperStyle,
    descriptionLocation = 'below',
  } = formContext as GenericObjectType

  const formData = formContext.formData as Record<string, any>
  const setFormData = formContext.setFormData as React.Dispatch<React.SetStateAction<Record<string, any>>>

  const path = id
    .replace(/^root_?/, '') // remove root prefix
    .replace(/_/g, '.') // underscores to dots
    .replace(/\.(\d+)(\.|$)/g, '[$1]$2') // numeric keys to array indices

  const uiOptions = getUiOptions<T, S, F>(uiSchema)
  const WrapIfAdditionalTemplate = getTemplate<'WrapIfAdditionalTemplate', T, S, F>(
    'WrapIfAdditionalTemplate',
    registry,
    uiOptions,
  )

  const isNullable = useMemo(() => Array.isArray(schema.type) && schema.type.includes('null'), [schema.type])
  const isNull = useMemo(() => get(formData, path) === null, [formData, path])
  const showLabel = useMemo(
    () => (isNullable ? true : typeof uiOptions.label === 'boolean' ? uiOptions.label : displayLabel),
    [isNullable, uiOptions.label, displayLabel],
  )

  const toggleNull = useCallback(
    (e: CheckboxChangeEvent) => {
      if (e.target.checked) {
        setFormData((prev) => {
          const newValue = cloneDeep(prev)
          set(newValue, path, null)
          return newValue
        })
      } else {
        setFormData((prev) => {
          const newValue = cloneDeep(prev)
          unset(newValue, path)
          return newValue
        })
      }
    },
    [setFormData, path],
  )

  const labelNullable = useMemo(
    () => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{label}</span>
        {isNullable && (
          <Checkbox style={{ marginLeft: 8 }} checked={isNull} onChange={toggleNull}>
            <Text type="secondary">null</Text>
          </Checkbox>
        )}
      </div>
    ),
    [isNullable, isNull, label, toggleNull],
  )

  const asCard = getJsValueByPath(schema, 'x-card', false)
  const CardWrapper = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      if (asCard) {
        return (
          <Card size="small" title={showLabel ? labelNullable : undefined}>
            {children}
          </Card>
        )
      }
      return <>{children}</>
    },
    [asCard, labelNullable, showLabel],
  )

  if (hidden) {
    return <div className="rjsf-field-hidden">{children}</div>
  }

  // check to see if there is rawDescription(string) before using description(ReactNode)
  // to prevent showing a blank description area
  const descriptionNode = rawDescription ? description : undefined
  const descriptionProps: GenericObjectType = {}
  switch (descriptionLocation) {
    case 'tooltip':
      descriptionProps.tooltip = descriptionNode
      break
    case 'below':
    default:
      descriptionProps.extra = descriptionNode
      break
  }

  return (
    <CardWrapper>
      <WrapIfAdditionalTemplate
        classNames={classNames}
        style={style}
        disabled={disabled}
        id={id}
        label={label}
        onDropPropertyClick={onDropPropertyClick}
        onKeyChange={onKeyChange}
        readonly={readonly}
        required={required}
        schema={schema}
        uiSchema={uiSchema}
        registry={registry}
      >
        <Form.Item
          colon={colon}
          hasFeedback={schema.type !== 'array' && schema.type !== 'object'}
          help={(!!rawHelp && help) || (rawErrors?.length ? errors : undefined)}
          htmlFor={id}
          label={showLabel && labelNullable}
          labelCol={labelCol}
          required={required}
          style={wrapperStyle}
          validateStatus={rawErrors?.length ? 'error' : undefined}
          wrapperCol={wrapperCol}
          {...descriptionProps}
        >
          {isNullable && isNull ? null : children}
        </Form.Item>
      </WrapIfAdditionalTemplate>
    </CardWrapper>
  )
}

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
  FieldTemplate,
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
  const fixedJs = useRjsfJs({ js, data: formData, evalify: true, nullablify: true })
  const uiSchema = useRjsfUiSchema({ js: fixedJs, scope: 'form', globalOptions: uiSchemaGlobalOptions })
  const [wasSubmitted, setWasSubmitted] = useState(false)
  const fixedInitialValues = useRjsfData({
    js: fixedJs,
    data: initialValues || refineForm.formProps.initialValues,
    removeAdditional: true,
  })
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
      formContext={{
        formData,
        setFormData,
      }}
      uiSchema={uiSchema}
      onChange={(e) => {
        setFormData(e.formData as any)
      }}
      onSubmit={(e) => {
        setWasSubmitted(true)
        void refineForm.onFinish(e.formData as any)
      }}
    />
  )
}
