import { FormPage, type UseFormProps } from '@admin/core/lib/form'

export const ResourceCreatePage = (input: Omit<UseFormProps, 'type'> = {}) => {
  return <FormPage {...input} type="create" />
}
