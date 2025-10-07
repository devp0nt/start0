import { refine0 } from '@admin/app/lib/refine'
import { RjsfForm } from '@admin/core/lib/rjsf.form'
import { Create, Edit, useForm as useRefineForm, type UseFormProps as UseRefineFormProps } from '@refinedev/antd'
import { Alert } from 'antd'
import { useRef } from 'react'

export type UseFormProps = {
  useRefineFormProps?: UseRefineFormProps
  type: 'create' | 'edit'
}

export const FormPage = ({ useRefineFormProps, type }: UseFormProps) => {
  const refineForm = useRefineForm({ ...useRefineFormProps })
  const formRef = useRef<any>(null)
  const resource = refine0.useResourceWithAction()
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
    >
      {!resource ? (
        <Alert type="error" message="No schema found" />
      ) : (
        <RjsfForm formRef={formRef} js={resource.js} refineForm={refineForm} />
      )}
    </Parent>
  )
}
