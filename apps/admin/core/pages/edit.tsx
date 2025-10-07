import { FormPage, type UseFormProps } from '@admin/core/lib/form'

export const ResourceEditPage = (input: Omit<UseFormProps, 'type'> = {}) => {
  return <FormPage {...input} type="edit" />
}
