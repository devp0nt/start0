import { RJSFForm } from '@admin/core/lib/rjsf'
import { useResourceSchema } from '@admin/core/lib/schema'
import { useResourceTitle } from '@admin/core/lib/shared'
import { Create, Edit, useForm as useRefineForm, type UseFormProps as UseRefineFormProps } from '@refinedev/antd'
import { useRef } from 'react'

type UseFormProps = {
  useRefineFormProps?: UseRefineFormProps
  type: 'create' | 'edit'
}

const FormPage = ({ useRefineFormProps, type }: UseFormProps) => {
  const refineForm = useRefineForm({ ...useRefineFormProps })
  const formRef = useRef<any>(null)
  const schema = useResourceSchema()
  const title = useResourceTitle()
  const Parent = type === 'create' ? Create : Edit
  return (
    <Parent
      saveButtonProps={{
        ...refineForm.saveButtonProps,
        onClick: () => {
          formRef.current.submit()
        },
      }}
      isLoading={refineForm.formLoading}
      title={title}
    >
      <RJSFForm formRef={formRef} schema={schema} refineForm={refineForm} />
    </Parent>
  )
}

export const ResourceCreatePage = (input: Omit<UseFormProps, 'type'> = {}) => {
  return <FormPage {...input} type="create" />
}

export const ResourceEditPage = (input: Omit<UseFormProps, 'type'> = {}) => {
  return <FormPage {...input} type="edit" />
}
